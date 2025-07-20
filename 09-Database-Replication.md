# Database Replication

## Master/Standby replication

It is also known as master-backup replication. It has:
- One master node that accepts writes and DDLs (Data Definition Language).
- There will be many read-only or standby nodes who receive those writes from the maaster. (You (the client) does not write to the standby nodes directly, you write to the master and it writes to the backup nodes.).
- Simple to implement (no conflicts)
- When you read, you can read against both master and replicas (eventual consistency)

![Alt text](Pictures/09/Database-replication-01.png)

## Muli-master replication

It is more complicated than the master-backup architecture (conflicts may easily arise). Hence most databases prefer the master-standby architecture. Multi-master architecture:
- Multiple master/leader nodes that accepts writes and DDLs
- One or more backup/follower nodes that receive the write requests.
- Need to resolve conflicts

## Synchronous vs. Asynchronous replication

In Synchronous replicatoin, a write transaction to the master is blocked until it is written to the backup/standby nodes. If you have several backup nodes, it is also customizable to say unblock the clients when the (e.g.) first two backup nodes are synchronized. Here you get full consistency.

In Asynchronous replication, a write transaction is considered successful if it is written to the master. Then the writes to the backup nodes are applied asynchronously.

## Replicatoin with `PostgreSQL 13`

The way we do it is using docker:
- spin up two postgre instances with docker
- make one master and the other one standby
- connect standby to master
- make master aware of the standby

Note: This is not best practice!

### Spinning up docker instances

We create the master:

```bash
docker run --name pmaster -p 5432:5432 -v /users/mone/.../rep/pmaster_data:/var/lib/postgresql/data -e POSTGRES_PASSWORD=postgres -d postgres
```

Using the `-v` (volume) argument any data written by PostgreSQL to `/var/lib/postgresql/data` inside the container will actually be stored in `users/mone/.../rep/pmaster_data` on your host machine.

This ensures data persistence: even if the container is stopped or deleted, your database data remains on your host.

In order to see the logs (`stdout` and `stderr`) from a container, you do:
```bash
docker logs <name-of-the-container>
docker logs pmaster
```

We can also create the `pstandby`:

```bash
docker run --name pstandby -p 5433:5432 -v /users/mone/.../rep/pstandby_data:/var/lib/postgresql/data -e POSTGRES_PASSWORD=postgres -d postgres
```

In the next step, we stop both containers and copy the data from master to standby:

```bash
docker stop pmaster standby
mv pstandby_data pstandby_data_bu
cp -r pmaster_data pstandby_data
docker start pmaster pstandby
```

### Linking the master and the backup

First you run:

```bash
docker stop pmaster pstandby
```

We need to change one file in the `pmaster_data`:

```bash
vim pg_hba.conf
# Then you add the following to line in host section:
host replication postgres all md5
# This is not best practice! you should not use the postgres user for replication (create another user.)
```

Then we go to `pstandby_data`:

```bash
vim postgresql.conf
# Then you uncomment the line:
#primary_conninfo = ''
# into:
primary_conninfo = 'application_name=standby1 host=mone port=5432 user=postgres password=postgres'
# port is that of the master and user is the one you defined in pg_hba.conf of pmaster_data.
```

The `primary_conninfo` setting tells the standby server how to connect to the primary (master) server in order to stream and replicate WAL (Write-Ahead Log) changes.

In the same folder (`pstandby_data`), you create this file:

```bash
touch standby.signal
```

Then you move to the `pmaster_data` folder, and make a slight change:

```bash
vim postgresql.conf
# Then you uncomment this line:
#synchronous_standby_names = ''
# and change the line to:
synchronous_standby_names = 'first 1 (standby1)'
# If you have many you can change it to e.g.
synchronous_standby_names = 'first 2 (standby1,standby2,standby3)'
synchronous_standby_names = 'any 2 (standby1,standby2,standby3)'
```

And that's all, here is how it works:

The standby “pulls” data from the master.

The master writes WAL locally, and makes it available for replication via its replication protocol (on the same port, `5432`).

The standby connects to the master using the info from `primary_conninfo`, then streams the WAL records.

You can now start the containers and check the logs:

```bash
docker start pmaster pstandby
docker logs pmaster
docker logs pstandby
```

Then if you do the following on `pmaster`:

```sql
create table test(id int, t varchar(200));
```

you can also read it on `pstandby`. But if you do it on `pstandby`, you'll get:

```txt
ERROR: cannot execute CREATE TABLE in a read-only transaction.
```


## Pros and Cons of Replication

Pros:
- Horizontal scaling (at least for reads, for writes you can also do it if you go mulit-master)
- Region based queries are possible - one database per region

Cons:
- Eventual consistency
- Slow writes (in synchronous replication)
- Complex to implement (multi-master)
