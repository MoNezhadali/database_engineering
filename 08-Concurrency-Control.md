# Concurrency Control

## Exclusive lock vs. Shared Lock

A shared lock allows multiple transactions to read (but not modify) the same data item concurrently. Shared locks prevent writing to the data while it is being read.

An exclusive lock allows a single transaction to both read and modify a data item. No other transaction can read or write the data item until the exclusive lock is released.
