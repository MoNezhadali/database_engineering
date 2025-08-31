# Some Best Practices

## What is the largest SQL statement that you can send to your Database

If you use a for loop to create a query (let's say for `1,000,000` ids), the size of the entire query text will be around 14 MB, and it crashes the server. It works for `1,00,000` ids, or around `1 MB`. Don't go much further.

## Best practices working with REST & Databases

1. It is best to make sure the user consuming the database, (inserting, deleting, querying, ...) is different from the user owning the schema or the table. It is best to create schema using a completely different script.

2. Use a pool of connections instead of one connection, e.g. because you do not know which response comes first.

3. Make sure you **do not use** the God user, e.g. `postgres` user for connections, since it has too many priviledges. For example you can create three users: one for only read, one for only create, and one for only delete.

4. Do not hard-code the password. One safe way is to use environment variables. Ideally create a non-comprehendible password and store it in a key vault.

5. You can also define the number of connections for each of the pools, e.g. defining minumum number of connections and extend it if required.

6. Do not use unbounded queries, e.g. use `LIMIT`.

7. Paremeterize your queries to avoid SQL injection.

8. Do not give too much information about the errors to the user, i.e. be confusing! This helps against intruders.
