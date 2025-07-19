# Concurrency Control

## Exclusive lock vs. Shared Lock

A shared lock allows multiple transactions to read (but not modify) the same data item concurrently. Shared locks prevent writing to the data while it is being read.

An exclusive lock allows a single transaction to both read and modify a data item. No other transaction can read or write the data item until the exclusive lock is released.

## Dead lock

A deadlock in databases happens when two or more transactions block each other forever because each holds a lock the other needs.

When a deadlock occurs database systems detect them and the last transaction who enters the deadlock is faild.

## Two-phase locking

Two-Phase Locking (2PL) is a concurrency control protocol used in databases to ensure serializability (the gold standard for transaction isolation).

It is done in two phases (growing and shrinking). 

In growing, the transaction acquires all the locks it needs (shared or exclusive). No locks are released during this phase. You can only request new locks — no unlocks allowed.

In shrinking, the transaction releases locks. No new locks can be acquired after releasing the first lock. Only unlocking is allowed.

The two-phase locking, ensures transactions behave like they are running one after the other, even if they overlap, avoids issues like dirty reads, lost updates, and inconsistent reads, can cause deadlocks since transactions may block each other while waiting for locks.
