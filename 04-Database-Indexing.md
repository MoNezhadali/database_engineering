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

