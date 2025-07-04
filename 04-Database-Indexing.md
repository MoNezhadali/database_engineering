# Database Indexing

## Creating a table with random values

In order to create a table with `1,000,000` rows with random numbers between `0` and `100`, you do:
```sql
CREATE TABLE temp(t int);

INSERT into temp(t) SELECT random()*100 from generate_series(1,1000000);
```
