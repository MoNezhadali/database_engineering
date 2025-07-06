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

## Combining database indices for better performance

Let's create an index on `a`:

```sql
create index on test(a);

create index on test(b);
```

If we run:

```sql
explain analyze select c from test where a = 70;
```

then, it will run a `Bitmap Index Scan` followed by a recheck and `Bitmap Heat Scan` because there are many rows where `a = 70`.

If we run this query:

```sql
explain analyze select c from test where a = 70 limit 2;
```

then it will be an `Index Scan` (PostgreSQL will understand and optimize it on its own.)

Same happens if you run these on `b` instead of `a`.

If we run a combined search like:

```sql
explain analyze select c from test where a=70 or b = 100;
```

it will run two `Bitmap Index Scan`, run logical operation (`or`) on them, and then run a `Bitmap Heat Scan` (with recheck).

An alternative is to drop indices:

```sql
drop index test_a_idx, test_b_idx;
```

Instead we can create a `composite index`:

```sql
create index on test(a,b);
```

Then if you run:

```sql
explain analyze select c from test where a = 70;
```

then PostgreSQL will use `test_a_b_idx` for `Bitmap Heat Scan` even though the search is on `a`. This is because `a` has been on the left-hand-side in (`index on test(a,b)`). If you run it on `b` it will run `Parallel Seq Scan`.

If you run:

```sql
explain analyze select c from test where a = 70 and b = 80;
```

It will run an `Index Scan` which is really fast, so in case queries are normally like `and` (`or` is still slow) operation on two columns, it is recommended to use `composite index`.

If you want to run an `or` operation, you can create one index on `b` in addition to the index on `(a,b)`, then PostgreSQL will run one `Bitmap index Scan` on `a` using `test_a_b_idx` and another `Bitmap index Scan` on `b` using `test_b_idx` and the `or` them together with recheck and `Bitmap Heap Scan` (just like the above).

NOTE: The composite index creates an index on both columns togther, ordered by `a` then `b`. It results in efficient queries that filter or sort by:

```sql
-- a
SELECT * FROM test WHERE a = 1;

-- a And b
SELECT * FROM test WHERE a = 1 AND b = 2;

-- a ORDER BY b
SELECT * FROM test WHERE a = 1 ORDER BY b;
```

## How does a database optimizer choose which index to choose?

Databases do some heuristics when it comes to choosing what to do: 

1. If there are many rows that satistfy the condition for `a` and many that satisfy the condition on `b`, the database engine does `bitmap index scan` on the two and `and`s them.

2. If one of the two only satisfies a few rows, and the other one many, then the databse engine directly goes to the `heap` after doing the search for one.

3. If both filters return a big proportion of the table, the database engine will decide to do `Seq Scan` on the table.

All of these are decided based on the `statistics` of the tables that the databases keep. The `analyze` command also uses these statistics to give estimates.

NOTE: In some databases, query performance can be suboptimal immediately after inserting rows if the query planner hasn't yet updated its statistics. This can cause the engine to choose a less efficient plan, possibly leading to a full table scan. Consider running `ANALYZE` or waiting for automatic stats updates if performance is critical.

If you are confident about your query, in some database systems you can even give hints, telling the engine which index to use. (in case you think you know better what to do compared to the database engine default heuristic behaviour.)

## Avoiding blocking production database writes by creating indices concurrently

If you create an index on a column in a table of a database, you CANNOT `write` concurrently. As a note, you CAN `read`. So it is a problem only with `writing`.

For doing so, you can:

```sql
create index concurrently g on grades(g)
```

Then you can do a write, while the index is being created.

```sql
-- you can write
insert into grades(g) values(1)
-- and you can read
select g from grades where id < 10;
```

There is a drawback there that the process of creating the index will take longer, more CPU usage, more memory, and may even fail, but normally you prefer that over breaking your live production code.

## Bloom filters

A bloom filter is a space-efficient, probabilistic data structure used in databases to quickly test whether an element might be present in a set. It works based on `hashing` the qurey input, so it can return false positves.

```text
Hash(Ali) % 64 = 4
```

Then mark the location `4` in your array as 1. Then if somebody else asks for the username `ali` it will return 1, then you go query the database. If it returns 0, you're sure it does not exist. You can also run several of these hash functions to reduce the odds of false-positves.
