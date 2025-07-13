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
