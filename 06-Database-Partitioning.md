# Database Partitioning

## What is partitioning?

It is dividing a big table into smaller tables which makes queries faster, e.g. if you have 1 million rows in a table, you can partition it into 5 tables of 200 hundred thousand rows. Remember that queries stay the same and the DB will manage the choosing of correct partition on it own.

## Vertical vs. Horizontal partitioning

Horizontal partitioning is partitioning the table by rows (range or list), e.g. every 200 thousand rows into one partition.

In vertical partitioning you divide through columns, e.g. you have a large column (blob) that you can store in a slow access drive in it own tablespace.

## Partitioning types

Partitioning can be based on:

1. By range, e.g Dates, ids. Example: by logdate or customerid from to

2. By list, e.g. discrete values. Example steates CA, AL, etc. or zip codes.

3. By Hash, hash functions. Example: hashing the IPs.

## Partitioning vs Sharding

Partitioning splits a big table into multiple tables in the same database, client is agnostic meaning that the client doesn't know which partition he is hitting; he queries the same query.

Sharding splits big table into multiple tables across multiple database servers. In this case client is aware of where he or she is hitting. This can be thought of as a limitation.

In partitioning the table name changes (or schemas). In sharding everything is the same but server changes.

## How to create partitions in PostgreSQL

```sql
-- have to define partition by:
create table grades_parts (id serial not null, g int not null) partition by range(g);

-- we create partitions one by one:
create table g0035 (like grades_parts including indexes);

-- You can check description of the table and you will see it is similar to grades_parts
\d g0035

-- you can also create all the four partitions:
create table g3560 (like grades_parts including indexes);
create table g6080 (like grades_parts including indexes);
create table g80100 (like grades_parts including indexes);

-- Then you will attach partitions one by one:
alter table grades_parts attach partition g0035 for values from (0) to (35);

alter table grades_parts attach partition g3560 for values from (35) to (60);

--- and so on.
```

## How to populate partitions and create indexes

```sql
-- This will automatically copy all the rows from the original table to the partitioned one
insert into grades_parts select * from grades_org;

-- Then you can run:
select max(g) from grades_parts;
-- or
select max(g) from g0035;
```

In `PostgreSQL` version `12` and onwards, you can directly create indexes on the partioned table and all its partitions:

```sql
create index grades_parts_idx on grades_parts(g);

-- Then if you do:
\d grades_parts;
\d g0035;
-- They will both show they have indexes created on them.
```

Then if we query on the partions:

```sql
explain analyze select count(*) from grades_parts where g=30;
-- you will see Index Only Scan using g0035_g_idx on g0035
```

In order to see the size of tables, and indexes:

```sql
select pg_relation_size(oid), relname from pg_class or der by pg_relation_size(oid) desc;
```

You will see that the smaller indexes are much smaller than the big index on the entire table, hence it is faster to query it.

Note that you want the `ENABLE_PARTITION_PRUNING` to be `on`. If it is `off`:

```sql
set enable_partition_pruning = off;
```

It will hit all the partions, meaning that the entire partitioning will be useless. Have it `on`.

## Pros and Cons of Partitioning

Pros of partitioning:
- Improves query performance when accessing a single partition
- Easy bulk loading (attach a partition), for example `MySQL` supports csv tables. If they are organized in a meaningful way, you can attach them as partitions and you are good!
- Archive old data that are barely accessed into cheap storage

Cons of partitioning:
- Updates that move rows from a partition to another are slow or fail sometimes (maybe it should be avoided because it actually affects the definition of what partition is).
- Inefficient queries could accidently scan all partitions resulting in slower performance
