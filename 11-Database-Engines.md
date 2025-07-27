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

## InnoDB

- B+tree - with indexes pointing to the primary key and the PK pointing to the row
- Replaced MyISAM
- Default for `MySQL` and `MariaDB`
- ACID compliant transactions support
- Foreign keys
- Tablespaces*
- Row-level locking
- Spatial operations*
- Owned by Oracle

**Tablespace**: A tablespace in a database is a storage structure used to define where and how the actual data (like tables and indexes) is stored on disk. In `Postgres`:

```sql
CREATE TABLESPACE fastspace LOCATION '/mnt/ssd1/dbdata';

-- then you can create a table:
CREATE TABLE users (
    id serial PRIMARY KEY,
    name text
) TABLESPACE fastspace;
```

**Spatial Operation**: Spatial operations in a database refer to operations that deal with spatial data — data that represents the location, shape, and relationship of objects in space, typically in 2D or 3D (like maps, geometries, and coordinates), e.g. `ST_Distance` calculates distance between two geometries.

## XtraBD

- Fork of `InnoDB`
- Was the default for `MariaDB` until `10.1`
- In `MariaDB 10.2` switched the default to `InnoDB`
- `XtraDB` could not be kept up-to-date with the latest features of `InnoDB` and cannot be used.
- System tables in `MariaDB` starting with `10.4` are all `Aria`.

## SQLite

- Very popular embedded database for local data.
- B-tree (LSM as extension)
- `Postgres`-like syntax
- Full ACID and table locking
- Concurrent read and writes
- Web SQL in browsers use it
- Included in many operating systems by default

# Aria

- Very similar to `MyISAM`
- Crash-safe unlike MyISAM
- **Not** owned by `Oracle`
- Designed specifically for `MariaDB` (fork from `MySQL`)
- In `MariaDB 10.4` all system tables are `Aria`. 
