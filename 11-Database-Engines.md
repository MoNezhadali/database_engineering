# Database Engines

Database engines are software libraries that DBMS (database management software) uses to do low-level storing of the data on disk.

It is a library that takes care of the on disk storage and `CRUD` (create, read, update, delete) operations.
- Can be as simple as key-value store
- Or as rish and complex as full support ACID and transations with foreign keys.

DBMS can use the database engine and build features on top (server, replication, stored procedures, etc.)

Want to write a new database? Don't start from scratch, use an engine!

Sometimes referred as storage engine or embedded database.

Some DBMS give you the flexibility to switch engines, e.g., `MySQL` and `MariaDB`.

Some DBMS some with a build-in engine that you cannot change, e.g., `Postgres`.
