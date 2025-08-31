# Some Best Practices

## What is the largest SQL statement that you can send to your Database

If you use a for loop to create a query (let's say for `1,000,000` ids), the size of the entire query text will be around 14 MB, and it crashes the server. It works for `1,00,000` ids, or around `1 MB`. Don't go much further.

## Best practices working with REST & Databases

1. It is best to make sure the user consuming the database, (inserting, deleting, querying, ...) is different from the user owning the schema or the table. It is best to create schema using a completely different script.
