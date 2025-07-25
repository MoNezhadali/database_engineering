# Database Sharding

Database sharding is the process of segmenting the data into partitions that are spread on multiple database instances.

This is done to spead up the query and scale the database.

## What is database sharding?

Imagine you have a url-shortner (you store the actual urls in a database and redirect to them based on the shortner). If there are milltions of URLs, you should shard them across different database instances, and the way you decide on where to store them can be done using `hash` functions.

## Consistent Hashing

The idea of hashing here is similar to classic `hash` functions. It is a deterministic function whose output somehow always points to one speciefic database for one specific input string.

## Horizontal Partitioning (HP) vs Sharding

HP splits a big table into multiple tables in the same databse.

Sharding spits a big table into multiple tables across multiple database servers.

In HP the table name changes (or schema). However, in sharding everything is the same but the server changes.

## Sharding with Postgres

First we create the `init.sql` file to be run in every database instance (e.g. in docker)

```sql
CREATE TABLE URL_TABLE
(
    id serial NOT NULL PRIMARY KEY,
    URL text,
    URL_ID character(5)
)
```

Then we can create a `Dockerfile`:

```Dockerfile
FROM postgres
COPY init.sql /docker-entrypoint-initdb.d
```

The `PostgreSQL` official Docker image automatically runs scripts placed inside `/docker-entrypoint-initdb.d/`.

Then we can create the image by:

```bash
docker build -t pgshard .
```

Then we can run our containers:

```bash
docker run --name pgshard1 -p 5432:5432 -d pgshard
docker run --name pgshard2 -p 5433:5432 -d pgshard
docker run --name pgshard3 -p 5434:5432 -d pgshard
```

Given we already have a docker container running called `pgadmin` listening to port `5555`, then you can go to GUI of `pgadmin` (a software for administration), and create and add your shards.

NOTE: When you use this type of sharding (also explained under `Projects/07-writing-to-a-shard/index.js`), you cannot add one more shard randomly. That specific implementation is for a fix number of shards, if you change that number in the backed randomly, it will screw everything!

## Pros and Cons of Sharding

Pros of sharding:

- Scalability (both in data and memory)
- Security (users can access certain shards, not others)
- Optimal and smaller index size

Cons of sharding:

- Complex client (we are aware of shards when querying)
- Transactions across shards is a problem
- Rollbacks (if dependent transactions go through in one shard and not in another shard)
- Schema changes (you have to add a row in all the shards)
- Joins (it is maybe not even possible to do joins across databases)
- If want to query something that does not go through the hash function (e.g. name of the customer) then you have to hit all the databases

## When should I shard my database

There are many things that you should consider before sharding:
- If your reads are slow, consider partitioning
- If there are too many read queries, and it is overwhelming your server, if caching does not help, you can do replication (and redirect reads to them using e.g. Nginx). Since writing is normally fast, you can keep writing to the master (which periodically pushes to the replicas). Try to avoid writing to replicas since it can result in inconsistency.
- Note that if you do sharding, then the database engine will not be able to gaurantee ACID rules, you are technically working with different databases. There are some third-party applications that can take care of sharding for you, i.e. you only not knowing about the shards.
