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
