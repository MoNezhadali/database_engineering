# MemCached In-Memory Database Architecture

Memcached is an in-memory key-value store originally written in Perl and later rewritten in C. It is popular with companies such as Facebook, Netflix and Wikipedia for its simplicity.

While the word “simple” has lost its meaning when it comes to describing software, I think Memcached is one of the few remaining software that is truly simple. Memcached doesn’t try to have fancy features like persistence or rich data types. Even the distributed cache is the responsibility of the client not Memcached server.

Memcached backend has one job only, an in-memory key value store.

We cover the following topics in this chapter.
- Memory Management
- LRU
- Read/Writes

## Memory Management

When allocating items like arrays, strings or integers, they usually go to random places in the process memory. This leaves small gaps of unused memory scattered across the physical memory, a problem referred to as fragmentation.

Memcached avoids fragmentation by pre-allocating fixed-sized memory pages. The pages are divided into equal size Chunks. The chunk has a fixed size determined by the slab class. A slab class defines the chunk size, for example Slab class 1 has a chunk size of 72 bytes while slab class 43 has a chunk size of a 1MB.

## LRU (Least Recently Used)

Memcached releases anything in memory that hasn’t been used for a very long time. That’s another reason why Memcached is called transient memory. Even if you set the expiration for an hour, you can’t rely on the key being there before the hour expires. It can be released at any time, which is another limitation (or feature!) of Memcached.

## Read and Writes

To identify where the item lives in memory for a given key, Memcached uses hash tables. A hash table is an associative array. The beauty of an associative array is that it is consecutive, meaning that if you have an array of 1000 elements, accessing elements 7, 12, 24, 33, or 1 is just as fast because you know the index. Once you know the index, you can immediately go to that location in memory.

If we need to write a key with a new value of 44 bytes, we first need to calculate the hash and find its index in the hash table. If the index location is empty, a new pointer is created, and a slab class is allocated with a chunk. 

Because hashing maps keys to a fixed size, two keys may hash to the same index causing a collision. Let’s say I’m going to write a new key called “Nani”. The hash of “Nani” collides with another existing key.

To solve this, Memcached makes each index in the hash table map to a chain of items as opposed to the item directly. We add the key “Nani” to the chain which has now two items. When the key is read, all items in the chain need to be looked up to determine which one matches the desired key, giving us a O(N) at worse case. Here is an example

## Description of Structure

MemCached is an in-memory key value store. It consists of `items` each of which is a pair of `key` and `value`. `key` is a string (`max 250 char`). The value can be any type (maximum `1 MB` but configurable). Keys have expiration date (TTL, time to live), but it is not reliable. Everything is stored in the memory.

Since `values` are of different sizes in order not to define same chunk size for all of them, MemCached has defined differnent **Slab Classes**. Let's say each page is maximum `1 MB`. If an item is `40 Bytes`, it goes to **Slab Class 1**, in which `14563` chunks are fit in one page. If the item is `900 KB`, It goes to **Slab Class 43**, where only one chunk is fit in one page. If all the pages of a slab class are full, another page of that slab class is created for the new item.

### LRU (Least Recently Used)

The way least recently used items are found is through maintaining a `linked list` which has a head and a tail. Whenever an item is accessed, it is taken from the `tail` (or wherever it is), and attached to the `head`. Items that are not used may get removed. There is an LRU crawler/daemon that does the cache eviction. There is an LRU cache per slab class.

## Threading

Memcached listen on a TCP port (11211) by default. For each connection a new thread is created. There used to be one global lock (a real bottleneck), but now there exists one lock per item, which is much better.
