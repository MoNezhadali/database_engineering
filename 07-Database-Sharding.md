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
