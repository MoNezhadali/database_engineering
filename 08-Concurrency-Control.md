# Concurrency Control

## Exclusive lock vs. Shared Lock

A shared lock allows multiple transactions to read (but not modify) the same data item concurrently. Shared locks prevent writing to the data while it is being read.

An exclusive lock allows a single transaction to both read and modify a data item. No other transaction can read or write the data item until the exclusive lock is released.

## Dead lock

A deadlock in databases happens when two or more transactions block each other forever because each holds a lock the other needs.

When a deadlock occurs database systems detect them and the last transaction who enters the deadlock is faild.
