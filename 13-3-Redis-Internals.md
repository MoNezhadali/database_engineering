# Redis Internals

Redis is an in-memory **NoSQL** database, which means it is primarily used as a cache. When it is a cache it is not persistent. That is why they came up with the idea of `snapshots` of the database. It was primarily a `key-value` store, but it has more features now.

## In-memory key-value store

Notes:

- Redis is a key-value store NoSQL database.
- Key is a string, value is pretty much anything.
- Redis is in-memory first.
- Single-threaded unless durability is enabled.

## Optional Durability

Journaling (Append Only Log AOP)
Snapshotting (instead of every transaction to be logged to the disk, we can snapshot the entire thing)
Both of these happen asynchronously in the background.
