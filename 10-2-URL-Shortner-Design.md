# URL-Shortner Design

## Solution 1

Let's assume the logic here is that we store the `URL` and its `ID` in a table, and we'll send the user the id itself as the url shortner.

For better read, we can index the `ID` column. By the passage of time, the `write` is going to be slower and slower (because the `B-Tree` has to be maintained.). In order to keep the writes fast, we can use `LSM` (`Log-Structured Merge-tree`), which is a data structure optimized for high write throughput. `LSM` is not native in `PostgreSQL`, it can bring LSM-like behavior using some extensions. However, if we want LSM-style storage in a relational context, we should use alternatives like e.g. `RocksDB`.

One issue with this implementation is that random people can access all the URLs. Another issues is that you cannot create custom urls.

## Solution 2


