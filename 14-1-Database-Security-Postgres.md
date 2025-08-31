# Database Security for Postgres

## Securing Postgres by enabling TLS/SSL

Given you have spinned up your docker container of Postgres:

```bash
docker run --name pg -p 5432:5432 postgres
```

Then we want to spin off a `pgadmin` from **David Page**'s account:

```bash
docker run -e PGADMIN_DEFAULT_EMAIL="some-email" -e PGADMIN_DEFAULT_PASSWORD="some-password" -p 5555:80 --name pdadmin dpage/pgadmin4 
```

Then you can **browse** to `localhost:5555` to access `pgadmin` and access the Postgres database through that. However, it is not a secure connection.

In order to secure it:

```bash
docker exec -it pg bash

# and then inside the container:
apt-get update && apt-get install vim
# Then we go to:
cd var/lib/postgresql/data

vim postgresql.conf
# From there uncomment ssl and turn it to on:
ssl = on
# And also define the ssl certificate file and ssl key file
ssl_cert_file = 'cert.pem'
ssl_key_file = 'private.pem'


# Then we create these two files using openssl in terminal
openssl req -x509 -newkey rsa:4096 -nodes -keyout private.pem -out cert.pem 
# Note that -nodes stands for 'no digital encryption standard'

# Then it will create the tow required files for SSL and you should:
chmod 600 private.pem
chown postgres private.pem
```

## Postgres Wire Protocol with WireShark

### Wireshark

Wireshark is a network protocol analyzer (or packet sniffer). It captures packets traveling over a network and lets you inspect them in detail.

#### Use case

Developers, sysadmins, and security analysts use it to debug network issues, analyze traffic, or reverse-engineer protocols.

#### With PostgreSQL

Since PostgreSQL communicates with clients (like psql or applications) over TCP/IP, Wireshark can capture and decode this traffic. Wireshark has a built-in dissector for the PostgreSQL wire protocol, meaning it can interpret PostgreSQL packets instead of just showing raw TCP data.

### PostgreSQL Wire Protocol

The PostgreSQL wire protocol (also called the frontend/backend protocol) is the low-level, binary/text protocol used for communication between PostgreSQL clients and the server over TCP/IP.

#### Key features

- Runs typically on port 5432.
- Handles startup/authentication (e.g., sending username, password, SSL/TLS negotiation).
- Manages query execution (Query, Parse, Bind, Execute messages).
- Uses a message-based structure: every message has a 1-byte type code and a 4-byte length, followed by message contents.
- Supports both simple query protocol (sending full SQL strings) and extended query protocol (parse/prepare/bind/execute steps).

Example message flow:

- Client → Server: Startup message (protocol version, parameters).
- Server → Client: Authentication request (e.g., AuthenticationCleartextPassword, AuthenticationMD5Password).
- Client → Server: Password response.
- Server → Client: AuthenticationOk, then ReadyForQuery.
- Client → Server: Query (SELECT 1;).
- Server → Client: RowDescription, DataRow, CommandComplete, ReadyForQuery.
