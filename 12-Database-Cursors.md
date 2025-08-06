# Database Cursors

A database cursor is a database object used to retrieve, manipulate, and navigate through a result set row by row, particularly when you need to process each row individually.

Imagine you want to see some data row by row:

```sql
select id from grades where g between 90 and 100;
```

what would you do if it was `1,000,000` rows?

Instead of retrieving everything altogether, we could create a **cursor** which retrieves the data at the proper time when we want to use it row by row.

## Defining a cursor

In order to define a cursor:

```sql
-- We have to define it in a transaction
begin;
declare c cursor for select id from grades where g between 90 and 100;
-- At this point the database does not execute the query, it only comes up with the plan to execute.
fetch c;
-- gives the first row
fetch c;
-- gives the second row
-- ...
-- you can also do:
fetch last c;
-- then it will execute the entire query and gets the last one; sometimes the database has the insight to get the last row in an efficient manner, sometimes it does not.
```

Doing so, you can fetch e.g. `100` rows, work with them, discard the memory, and go to the next `100`.

```sql
-- you can get 100 rows:
-- PostgreSQL:
fetch forward 100 from c;
```
Using cursors, you can:
- Stream the rows to some web-socket connection
- Cancel a cursor (plan to work with `1,000,000` rows, have worked with `100,000` rows, you roll-back and done)
- Page (pagination); it is not that easy with a cursor since cursors are stateful
- You can write fully-fledged programming languages with cursors (**PL/SQL**)

A note on pagination:
|Method | Analogy|
| --- | --- |
| **SQL Cursor** (stateful)| Reading a book with your finger holding your place. If you close it, you lose your spot. |
| **Cursor-based pagination** (stateless) | Using a bookmark — no memory needed, you just reopen and jump to the place.              |

Cons of cursors:
- It is stateful, meaning that there is some memory allocated for it in the database, and there is a corresponding transaction pointing to that cursor. If you make another request to another server (or another process) the other process would have no clue about the cursor. You cannot share the cursors (**That's a property of the transaction**)
- Long-running transactions; if you want to run through a cursor, it has to be run through a transaction, meaning that the transaction has to be running for a long time; it will bother indexing, DDL cannot be done on the table if somebody is connected, etc.

## Server-side vs. Client-side cursors

A **server-side** cursor is maintained on the database server. The client sends a query and the server holds the result set and the cursor that fetches rows from it. The **data remains on the server**.

A **client-side** cursor is when the **entire result set is fetched from the server to the client**, and the cursor operations (like navigation, scrolling) are performed on the client side.
