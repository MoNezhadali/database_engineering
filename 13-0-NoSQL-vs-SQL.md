# NoSQL vs SQL

Here is a bigger picture of databases:

**SQL databases** → Relational model + SQL query language (MySQL, PostgreSQL, Oracle, etc.)

**NoSQL databases** → Non-relational models, often without strict schemas (MongoDB, Cassandra, Redis, etc.) NoSQL isn’t one single thing — it’s a family:
- **Document stores** (MongoDB, CouchDB)
- **Key-value** stores (Redis, DynamoDB)
- **Column-family** stores (Cassandra, HBase)
- **Graph databases** (Neo4j, JanusGraph)

## Document Stores

**Examples**: MongoDB, CouchDB, ArangoDB

**Data model**: Stores data as documents (usually JSON or BSON) with flexible, nested structures.

**Best for**: Semi-structured data, content management, catalogs.

**Strengths**:
- Flexible schema — each document can have different fields.
- Good for hierarchical/nested data.

**Limitations**:
- Relationships are not as fast as in graph DBs (need joins/lookups).

## Key-Value Stores

**Examples**: Redis, DynamoDB, Riak

**Data model**: Stores data as {key: value} pairs — value can be a blob, string, JSON, etc. The difference with the **document store** is that it only key, the value is understood as a **blob** and is **not a document**, e.g. `JSON`.

**Best for**: Caching, session storage, fast lookups.

**Strengths**:
- Extremely fast for simple get/put operations.
- Scales horizontally with ease.

**Limitations**:
- Poor for complex queries or relationships.

## Column-Family Stores

**Examples**: Apache Cassandra, HBase, ScyllaDB

**Data model**: Similar to relational tables, but data is stored by columns instead of rows.
→ Optimized for reading/writing large volumes of specific columns.

**Best for**: Time-series data, analytics, IoT, write-heavy workloads.

**Strengths**:
- Handles massive datasets across many nodes.
- Very efficient for queries over specific columns.

**Limitations**:
- Query flexibility is limited compared to SQL.

## Graph Databases

**Examples**: Neo4j, JanusGraph, ArangoDB (multi-model)

**Data model**: Nodes (entities) and edges (relationships), often with properties on both.

**Best for**: Social networks, recommendation engines, fraud detection. **Edges** have direct references (**pointers**) to connected nodes — no lookup needed to traverse. Traversal cost is **O(hops)**, not **O(rows)**.

**Strengths**:
- Relationships are first-class and very fast to traverse.
- Complex queries over connected data are efficient.

**Limitations**:
- Not ideal for simple key-value lookups or bulk tabular analytics.