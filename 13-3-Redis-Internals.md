# Redis Internals

Redis is an in-memory database, which means it is primarily used as a cache. When it is a cache it is not persistent. That is why they came up with the idea of `snapshots` of the database. It was primarily a `key-value` store, but it has more features now.
