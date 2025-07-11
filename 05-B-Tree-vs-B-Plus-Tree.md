# B-Tree vs. B+Tree in Production

To find a row in a large table we perform full table scan. Scanning full table is very expensive in production. It requires many I/Os to read all the pages. We need a way to reduce the search space.

## Balanced Tree (B-Tree)

B-Tree is a balanced data structure for fast traversal. A B-tree consists of nodes. In B-Tree of `m` degree nodes can have `m` child nodes. Node has up to `m-1` elements. Each element has a key and a value. The value is usually data pointer to the row. Data pointer can point to primary key or tuple. Nodes consist of root Node, internal nodes, and leaf nodes. A node is a disk page.

If you remember the way one new element is added to an index (it is best if the data are added in a sorted way), a lot of spliting happens in the nodes. Hence you want to use a large `m` to avoid too much splitting. It also probably helps with retrieval (`O(log m(n))` instead of `O(log 2(n))`).
