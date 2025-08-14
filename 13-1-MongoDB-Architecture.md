# MongoDB

## Architecture

It is a document-based NoSQL database. It came popular because of its schema-less storage of documents.

You can divide a database into two parts:
- Frontend handling:
    - API
    - Data format
- Storage Engine, handling:
    - Storage
    - Indexes
    - Data files
    - Transactions
    - WAL

These sections work mostly decoupled from each other, e.g the fron-end gets/provides data in json format, but it can store the data files as binaries in storage engine.

On the front-end side, the **API** of MongoBD is not `SQL`, (hence NoSQL). The most important difference in `SQL` and `NoSQL` databases comes in the front-end. It accepts `JSON`, it transforms it into **binary** (`BSON`), and stores it on the disk.

For reading, it **used to** use an `index` which stores a `64-bit` variable called `Discloc` which includes filename `32-bits`, and offset (defining where in the file the corresponding data are, `32-bit`). Now it is `12-bytes` in total (it is also a user-controlled fields). You also have control over `id` itself. Hence, you should not use `UUID`, because it deteriorates the performance of the **index**.

## Clustered collections

In clustered collections, the collection’s data is **clustered** according to the index key, so lookups and range queries on that key are very fast. In some sense there will be one read (the clustered index and data), rather than reading the index and then looking up in the cluster.

```python
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime

client = MongoClient("mongodb://localhost:27017/")
db = client.testdb

# Create clustered collection
db.create_collection(
    "clustered_example",
    clusteredIndex={
        "key": {"_id": 1},
        "unique": True,
        "name": "clustered_by_id"
    }
)

# Case 1: Let MongoDB auto-generate _id
db.clustered_example.insert_one({"name": "Alice", "age": 30})

# Case 2: Provide your own _id (could be ObjectId or something else)
db.clustered_example.insert_one({"_id": ObjectId(), "name": "Bob", "age": 25})

# Case 3: Use _id as a datetime (can be useful for TTL expiry)
db.clustered_example.insert_one({"_id": datetime.utcnow(), "event": "Login"})

for doc in db.clustered_example.find():
    print(doc)

```

NOTE:
- The term `mongodb://localhost:27017/` follows `protocol`-`host`-`port` pattern, with `mongodb` being the `protocol` similar to `http`, or `https`.

Why can clustered collection be useful?

### Less disk usage:
No duplicate `_id` index structure → better for huge collections.

### Faster range scans:
If `_id` is time-based (like datetime or time-ordered ObjectId), fetching “last 1 hour of data” is lightning-fast.

### Better write locality:
New documents (with increasing `_id`) are appended at the “end” of storage → fewer page splits.

### TTL optimization:
If `_id` is a datetime, you can expire old documents without creating a separate TTL (time to live) index — MongoDB just drops old records in order.
