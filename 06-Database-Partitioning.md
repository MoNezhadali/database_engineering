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
