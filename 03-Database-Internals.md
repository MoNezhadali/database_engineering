# Database Internals

## row id

Internal and maintained by the system; in some DB systems it is the same as primary key, in some different.

## Page

Row oriented storage: optimized for OLTP (Online Transaction Processing): workloads with lots of small fast-reads and writes like inserting or updating a few rows at a time. Examples: MySQL, PostgreSQL, ... 

Column-oriented storage: Optimized for OLAP (Online Analytical Processing) – workloads involving scanning lots of rows but only a few columns, like in reporting or analytics. Examples: Amazon Redshift, ClickHouse, Apache Parquet files, Google BigQuery

Depending on the storage model (row vs column store), the rows are stored and read in logical pages. The DB does not read a single row, it reads a page or more in a single IO.

Each page has a size (e.g. 8KB in postgres) which translates to disk location.

## IO

IO operation (input/output) is a read request to the disk. We try to minimize this as much as possible.

An IO cannot read a single row. It's one or more pages with many rows in them. Some IOs go to operating system cache and not necessarily to the disk.

## Heap

The heap is data structure where the table is stored with all its pages on after another. This is where the actual data is stored.

Traversing the heap is expensive as we need to read so much data to find what we want. This is why we need `index` to tell us where (what pages) in the heap to read.

## Index

An index is another data structure separate from the heap that has pointers to the heap.

It has part of the data and is used to quickly search for something. You can index one or more column.

Index tells you EXACTLY which page to fetch in the heap instead of taking the hit to scan every page in the heap.

The index is also stored as pages and cost IO to pull the entries of the index. The smaller the index, the more it can fit in memory, the faster the search.

Popular data structue for index is `b-trees`.

Sometimes the heap table can be organized around a single index. This is called a clustered index or an index organized table.

Primary key is usually a clustered index unless otherwise specified.

InnoDB (the storage engine of MySQL) always have a primary key (clustered index), other indices point to the primary key "value".

Postgres only have secondary indices and all indices point directly to the row_id which lives in the heap.