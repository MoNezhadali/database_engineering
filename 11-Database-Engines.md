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

## MyISAM

- It is an improved version of ISAM (indexed sequential access method), developed by MySQL.
- B-tree (Balanced tree) indexes point to the rows directly.
- No transaction support (hence no ACID?).
- Open source and owned by `Oracle`.
- Inserts are fast, updates and deletes are problematic (fragments, due to update of indices).
- Database crashes corrupts tables (have to manually repair).
- Table-level locking (no row-level locking).
- MySQL, MAriaDB, and Percona (MySQL forks) support MyISAM
- **Used to** be default engine for `MySQL`.
