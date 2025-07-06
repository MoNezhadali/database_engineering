# Database Indexing

## Creating a table with random values

In order to create a table with `1,000,000` rows with random numbers between `0` and `100`, you do:
```sql
CREATE TABLE temp(t int);

INSERT into temp(t) SELECT random()*100 from generate_series(1,1000000);
```

## Getting started with indexing

The command `explain analyze` explains the query that comes next and tells how long it took.

```sql
explain analyze select id from employees where id = 2000;
```

This tells how much time it took for planning (e.g. whether to go to heap or the index, and the steps, etc.) and how much time it took for execution. In the query above it is much faster (e.g. `0.141 ms` execution time) because it only fetches the primary key (it only needs to go to the index). Unlike the query that comes after, which also needs to go to the table itself (e.g. `2.520 ms` execution time).

```sql
explain analyze select name from employees where id = 2000;
```

And if we run the same query again it takes only less time (e.g. `0.157 ms` due to caching).

However, if we do something like:

```sql
explain analyze select id from employees where name = 'Zs';
```

It will take much much longer (`3199.724 ms`) because name does not have an index and the engine has to scan the entire table. The slowest happens if you want to do some pattarn search in the `where` clause:

```sql
explain analyze select id from employees where name like '%Zs%';
```

However, we can create an index on employees name by:

```sql
create index employees_name on employees(name);
```

Then if we run the previous query it will be much faster (e.g. `47.089 ms`):

```sql
explain analyze select id from employees where name = 'Zs';
```

However, if you run an expression instead of an exact value, you'll be back to slow query (e.g. `1318.602 ms`). This is because the index will not be scanned anymore.

That means having the index does not necessarily mean it will be used. The engineer should give proper hints to the engine to be able to use the index and optimize the queries.

## Understanding the SQL querey planner and optimizer with explain

Let's assume we have a table with three columns: (`id`, `name`, and `g` (grade)) and it is indexed on `id` and `g` but not on `name`.

Let's start with the worst query:

```sql
explain select * from grages;
```

The result will be like:

```text
Seq scan on grages (cost=0.00..289025.15 rows=12141215 width=31)
```

The first number in `cost` before `..` shows how much time it took before fetching the data. The second number `289025` tells how much time does it `estimate` to run the query (based on its statistics). So this is not accurate, so is the rows (`12141215`). It is not accurate, but it gives a good estimate. That's why when you want to know the number of likes for a post on `Instagram`, you should run this not `count()` because what you want is an estimate and it is much cheaper. Then the `width` shows the number of `bytes` of each row.

If we run:

```sql
explain select * from grades order by g;
```

You'll get:

```text
Index Scan using g_index on grades (...)
```

Then it is using `g_index` which makes the `order by` faster.

If we run the following it will be much slower:

```sql
explain select * from grades order by name;
```

You'll get (you should read it bottom to top):

```text
Gather Merge (...)
Workers Planned: 2
Sort (cost=1023586.72..1036233.82)
Parallel Seq Scan on grades (...)
```

And this time even the preparation time (`1023 s` is very high.)

If we try:

```sql
explain select id from grades;
```

we get something like:

```sql
Seq Scan on grades (... width=4)
```

meaning that the id is `4 bytes` which makes sense because it is an integer. If you try it with `name` instead, you'll get something like `19 bytes` since it is a string of `19 bytes` (on average).

## Sequential table scan vs index scan vs bitmap index scan

If we run the query:

```sql
explain select name from grades where id=1000;
```

The result will be:
```text
Index Scan using grades_pkey on grades (...)
Index Cond: (id =1000)
```

If we run:

```sql
explain select name from grades where i<100;
```

we still get:

```text
Index Scan using grades_pkey on grades (...)
Index Cond: (id <100)
```

But if we ask for more rows, e.g.

```sql
explain select name from grades where i>100;
```

Then it is smart enought to switch to sequential scan:

```text
Seq Scan on grades (...)
Filter: (id > 100)
```

If you run a query like:

```sql
explain select name from grades g>95;
```

Then it's going to run a `Bitmap index scan`:

```text
Bitmap heat scan on greades(...)
Recheck cond: (g>100)
Bitmap Index scan on g (...)
```

where it marks all the pages in which the condition is satisfied using the index (bitmap), fetches all the pages, rechecks the condition, and delivers the results.

These can also get combined:

```sql
explain select name from grages where g>95 and id<10000;
```

Then it will create two `bitmaps` and run `and` logical operation on them. It will make it really efficient.

### Key vs Non-key column indices

In the query:

```sql
explain analyze select id, g from students where g > 8 and g < 95 order by g desc;
```

It has to do sorting (because of `desc`) and it has to do (parallel) sequential scan since there are no indices on `g`.

Then if we create an index on g, it will be faster:

```sql
create index g_idx on students(g);
```

Then the query:

```sql
explain analyze select id, g from students where g > 8 and g < 95 order by g desc;
```

Then based on the condition (if there was no condition, it may have used sequential scan probably, my idea), it uses index scan. If you limit the number of results it may be even faster.

If we want to create a `non-key` index, we can run:

```sql
drop index g_idx;

create index g_idx on students(g) include (id);
```

This builds an index on `g`, meaning it's ordered and searchable by `g`. The column `id` is included in the index payload, but not used for sorting or searching. THis allows `PostfreSQL` to satisfy queries that need `id` without reading the main table (the heap).

Then if we run:

```sql
explain (analyze,buffers) select id, g from students where g > 10 and g < 20 order by g desc;
```

It will be an index only scan, where we do not go to the heap. The `buffers` argument will create a report like this:

```text
Buffers: shared hit=123 read=4 dirtied=0 written=0
```

where `shared hit` reports the cache hits, `read` reports the reads from the disc, `dirtied` reports the modified pages, and `written` reports the written pages back to the disc.

A command like:

```sql
vacuum (VERBOSE) students;
```

can be used to clean up dead tuples, free up space, update statistics, prevent table bloat over time, and keep index pages clean and updated. However, `vaccum` is run automatically by itself by default.

## Index Scan vs. Index Only Scan

If there is an index on ids, the following will be an `index scan`:

```sql
explain analyze select name from grades where id = 7;
```

which is fast, but it has to go to the `heap` to fetch the `name`. However, you create an index like this:

```sql
create index id_idx on grades(id) include (name);
```

where `id` is a key column and `name` is a `non-key` column, then the afrementioned query will be `index only scan`, which is faster.
