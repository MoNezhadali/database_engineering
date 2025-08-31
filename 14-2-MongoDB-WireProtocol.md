# MongoDB Wire Protocol

A binary message protocol over TCP/IP (default port 27017) that defines how MongoDB clients (like the shell or drivers) talk to the MongoDB server.

## Purpose

Handles everything — from authentication to database commands, queries, inserts, and replication traffic.

## Message Structure

MongoDB messages are sent as BSON-encoded documents (Binary JSON), with each message having a fixed header.

### General format (for each message)

- Message Header (16 bytes):
- messageLength (int32): total message size (including header).
- requestID (int32): identifies request.
- responseTo (int32): matches replies to requests.
- opCode (int32): the operation type.
- Message Body (depends on opCode).
