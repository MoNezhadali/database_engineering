# B-Tree vs. B+Tree in Production

To find a row in a large table we perform full table scan. Scanning full table is very expensive in production. It requires many I/Os to read all the pages. We need a way to reduce the search space.

## Balanced Tree (B-Tree)

B-Tree is a balanced data structure for fast traversal. A B-tree consists of nodes. In B-Tree of `m` degree nodes can have `m` child nodes. Node has up to `m-1` elements. Each element has a key and a value. The value is usually data pointer to the row. Data pointer can point to primary key or tuple. Nodes consist of root Node, internal nodes, and leaf nodes. A node is a disk page.

If you remember the way one new element is added to an index (it is best if the data are added in a sorted way), a lot of spliting happens in the nodes. Hence you want to use a large `m` to avoid too much splitting. It also probably helps with retrieval (`O(log m(n))` instead of `O(log 2(n))`).

## Limitations of B-Trees

B-Trees store both the keys and the values. Meaning that when reading them a lot of I/Os have to happen unwantedly (the values or pointers to the pages). In other words, internal nodes take more space, thus require IO and can slow down traversal. In addition, range queries are slow because of random access (they are aquired one by one, one traversal per key).

## B+Tree

B+Tree is exactly like a B-tree but only stors keys in internal nodes. Values are only stored in leaf nodes. Internal nodes are smaller since they only store keys and they can fit many more elements. Leaf nodes are linked so once you find a key you can find all values before and after that key (which helps a lot in range quries.). One important note is that when the value you search for is equal to the node you go in a specific direction, e.g. in birnary you go right. (you'll finally find the value for that key at the leaf, i.g. in the leaf there is a duplicate of the key you search for and its corresponding value.)
