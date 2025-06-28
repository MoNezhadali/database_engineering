# ACID concepts

## What is a transaction

A transaction is a collection of queries which is treated as one unit of work, e.g. account deposit: SELECT, UPDATE, UPDATE

A transaction always starts with `BEGIN`.

When you are happy with the transaction, you `COMMIT` and the transaction gets persisted in the database.

When you want the changes to be rolled back you `ROLLBACK`, e.g. due to crash.

Each of the databse systems is optimized for one purpose, e.g. `POSTGRES` is the fastest with `COMMIT`.

Usually transactions are used to change the data, but it is normal to have `read-only` transactions.

## Atomocity

All the queries in a given transaction must succeed (they are an atom all togehter).

If one query fails, all prior successful qureies in the transaction should rollback.

If the database went down prior to a commit of a transaction, all the successful queries in the transaction should rollback.

## Isolation

Can my inflight transaction see changes made by other concurrent transactions?

### Read phenomena

Dirty-read: you wrote something but it is not fully commited

Non-repeatable read: you trying to read something, but the database tries to read the value again that changes. `POSTGRES` versions the data and avoids this issue. `SQL-server` keeps undo tables.

Phantom reads: things that you try to read but cannot because they do not exist yet.

Lost updates: when you try to read something which is not updated yet.

### Isolation levels

Read uncommitted: No isolation, any change from the outside is visible to the transaction, committed or not (only `SQL-server` supports it)

Read committed: Each query in a transaction only sees committed changes by other transactions. (The default isolation level for many database systems)

Repeatable read: The transaction will make sure that when a query reads a row, that row will remain uncahnged while the transaction is running.

Sanpshot: Each query in a transaction only sees the changes that have been committed up to the start of the transaction. It's like a snapshot version of the database at that moment. (It's guaranteed to get rid of all the read phenomena)

Serializable: Transactions are run as if they are serialized one after the other.

### Database implementation of isolation

Pessimistic: Row level locks, table locks, page locks to avoid lost updates.

Optimistic: No locks, just track if things changed and fail the transaction if so.

Repeatable read (RR) lock: It locks the rows it reads but it could be expensive if you read a lot of rows, postgres implements RR as sanpshot That is why you don't get phantom reads with postgres in repeatable read

Serialiazble are usually implemented with optimistic concurrency control, you can implement it pessimistiacally with `SELECT FOR UPDATE`.

## Consistency

`Consistency in data`: It ensutes that the databse remains in a valid state after any transaction.

- defined by the user
- referential integrity (foreign keys)
- atomicity
- isolation 

e.g. picture 1 has got 5 likes, but it does not equate the count of the likes of all people who likes it.

`Consistency in reads`: If you write a new value to a database node, how soon will a read from another node reflect that update?

## Durability

Changes made by committed transactions must be persisted in a durable non-volatile storage.

Durability techniques:
- WAL, write ahead log
- Asynchronous snapshot


## Hands-on practices:

In order to run a postgres server using docker, run:

```bash
docker run --name pgacid -d -e POSTGRES_PASSWORD=postgres postgres:13
```

In order to go to the container interactively, you run:

```bash
docker exec -it pgacid psql -U postgres
```

Then you can run SQL code in the terminal:

```sql
create table products (pid serial primary key,
name text,
price float,
inventory integer);
```

Then,

```sql
insert into products(name, price, inventory) values('Phone', 999.99, 100);
```

then,

```sql
select * from products;
```

In best case you should run the above in a transaction:

```sql
begin transaction;
select * from products;
update products set inventory = inventory -10;
commit;
```

If any of the steps fail, the rest will not be run, and before running `commit` no change will be seen to other sessions.

But in order to keep the transaction from inconsistency, we can run it with defining isolation level (the default is read commited)

```sql
begin transaction isolation level repeatable read;
select * from products;
```

even if somebody else changes the table in the meantime, we do not recognize it.

In order to get the transaction isolated from all other transactions, you can use `isolation level serializable`.

```sql
begin transaction isolation level serializable;
```