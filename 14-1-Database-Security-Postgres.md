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
