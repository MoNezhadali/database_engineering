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

## Double-booking problem

Double-booking problem happens when two people try to book the same seats in a cinema.

If you do something like:
```sql
begin transaction;
select * from seats where id = 13;
update seats set isbooked = 1, name = 'Mohammad' where id = 13;

-- and at the same time somebody else does:
begin transaction;
select * from seats where id = 13;
update seats set isbooked = 1, name = 'Akbar' where id = 13;
```
Then it will result in double-booking. One way to solve it is with two-phase locking:

```sql
begin transaction;
-- Use for update to acquire an exclusive lock
select * from seats where id=13 for update;
update seats set isbooked = 1, name = 'Mohammad' where id = 13;
commit;
```

After commiting the exclusive lock is released, and hence it avoids double-booking.

### Alternative approach

Alternatively, you can run:

```sql
begin;
update seats set isbooked = 1, u = 'Mohammad' where id = 1 and isbooked =0;
commit;
```

and if somebody else does:

```sql
begin;
update seats set isbooked = 1, u = 'Rick' where id = 1 and isbooked =0;
```

in this case it works at the mercy of `PostgreSQL` (the information about the lock is stored in the row itself in `PostgreSQL`) because it implements a lock and waits until the other transaction is over. Then it will not update the pre-booked row. If the `id` or `isbooked` is indexed, maybe it does not go to row and update it (or maybe it will, we are not sure, but it's not good practice to be at the mercy of the database engine). But in general `PostgreSQL` is a pessimistic concurrency control database system and it takes care of many possible issues.

## A note on SQL offset

`offset` is used to drop the first `1000` rows. You should not use `offset` like this:

```sql
select title, id from news offset 1000 limit 10;
```

Issues:
- If a new row is inserted in the meantime it will not take that into account (if you go to the new page, the first item is the last item you read in the previous page)
- It gets increasingly slower and slower with increase in id

First you should find the `id` (given id is increasing) of the last row you want and then:
```sql
select title, id from news where id < 100999993 ordr by id desc limit 10;
```

This will be much faster.

## Database Connection Pooling

You should not create a connection to the database in every query you want to run (like `Projects/08-database-connection-pooling/old.js`). You should create a pool of connections, defining max number and max time for destroying them if idle like (`Projects/08-database-connection-pooling/pool.js`). It is much faster.
