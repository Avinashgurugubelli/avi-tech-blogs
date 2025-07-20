
<!--
author: "Avinash Gurugubelli",
title: "Distributed Consistency Models: Tradeoffs, Use Cases, and Suitable Databases",
description: "A practical guide to distributed consistency models, their tradeoffs, real-world use cases, and recommended databases for each scenario.",
tags: [
  "Distributed Systems",
  "Consistency Models",
  "Serializability",
  "Linearizability",
  "Snapshot Isolation",
  "Eventual Consistency",
  "System Design",
  "Database Selection",
  "CAP Theorem"
],
references: [{
  title: "Designing Data-Intensive Applications",
  author: "Martin Kleppmann",
  url: "https://dataintensive.net/"
}]
-->

# Distributed Consistency Models: Tradeoffs, Use Cases, and Suitable Databases

Choosing the right consistency guarantee in distributed systems is all about balancing correctness, performance, and availability. Below are common real-world use cases illustrating these tradeoffs—and recommendations for database technologies aligned with each scenario.

## 1. Strict Serializability (External Consistency): Ultimate Correctness
---------------------------------------------------------

### Use Cases

* Financial Applications: Inter-bank transfers, stock trading, or high-value payments where every transaction must be atomic, ordered, and fully up-to-date.
* Global Inventory Management: Airline seat booking, hotel reservations, or critical logistics, where double-booking or phantom inventory isn’t acceptable.
* Distributed Locking: Leader election or coordinator roles in fault-tolerant control systems, where only a single entity must act at a time.
* Legal & Compliance Systems: Any application where “the single source of truth” is absolutely required for audits or regulatory reasons.

### Tradeoffs

* Increased transaction latency, especially across regions.
* Systems may block or error during network partitions to preserve consistency.

### Recommended Databases

* Google Spanner: Offers external consistency across global deployments.
* CockroachDB: Open-source, supports strict serializability at scale.
* FoundationDB: ACID-compliant, supports clusterwide strict serializability.
* Aerospike Database: High-performance with strict serializability guarantees.

## 2. Serializability (Transactional, Not Always Real-Time Fresh)
---------------------------------------------------------

### Use Cases

* Multi-object Business Processes: E-commerce shopping carts, order fulfillment, or insurance claim processing—actions must not interleave, but instant recency is less important.
* Workflow Systems: Where the sequence of multi-step transactions matters, but temporary inconsistency in what is read is acceptable.
* Bank Transfers Within a Single Bank: As long as every transfer is complete, slight lag in reflecting new balances is tolerable.

### Tradeoffs

* Protects against transactional anomalies and corruption, but can serve "old" data on reads.
* Higher throughput than strict serializability, but less recency.

### Recommended Databases

* PostgreSQL (Serializable Isolation): Popular single-node isolation; some clustered variants extend this.
* Oracle/RDBMS with Serializable Mode: Available in many traditional databases.
* MySQL Group Replication (with session consistency): With proper configuration.

## 3. Linearizability (Single-Object Real-Time Freshness, Not Grouped)
---------------------------------------------------------

### Use Cases

* Distributed Locks and Coordination: ZooKeeper or etcd for leader election, distributed queues, and configuration where every participant must see the current state.
* Counting or ID Generation: Auto-increment keys or event counters that cannot have duplicates or "lost" increments.
* Uniqueness Constraints: Username, account ID, or routing slot assignment where real-time agreement is critical.

### Tradeoffs

* Reads and writes are always up-to-date for single objects, but no guarantees on atomicity across multiple objects or transactions.
* May require careful engineering to avoid partial updates.

### Recommended Databases/Services

* etcd: Distributed KV store with linearizable reads/writes.
* Apache ZooKeeper: Ideal for locks, distributed coordination.
* Consul: Similar coordination primitives.

## 4. Snapshot Isolation (Eventual Serializability, High Performance, Some Anomalies Allowed)
----------------------------------------------------------------

### Use Cases

* Large Scale SaaS Applications: Where most operations are independent and quick, and a small risk of “write skew” is acceptable.
* Content Management Systems: Collaborators working on different objects.
* Analytics Platforms: Where consistent point-in-time reads are needed, but across-the-board recency isn’t as crucial.

### Tradeoffs

* Excellent performance and reduced lock contention.
* Susceptible to certain anomalies (e.g., write skew), not strictly serializable.

### Recommended Databases

* Amazon Aurora / RDS (with SI): Supports snapshot isolation by default.
* CockroachDB (also supports stricter guarantees with overhead).
* PostgreSQL (Repeatable Read mode for snapshot isolation).

## 5. Eventual Consistency (Maximal Availability and Performance)
---------------------------------------------------------

### Use Cases

* Social Media Feeds & Timelines: User feeds, like counts, or non-critical engagement metrics where “eventual correctness” suffices.
* DNS & Caching Layers: High-read, low-criticality environments.
* Shopping Cart Save-for-Later: Infrequent, cheap conflicts are easily resolved by the user.

### Tradeoffs

* Reads can be stale, and concurrent writes can conflict.
* Maximizes uptime and throughput, even during network issues.

### Recommended Databases

* Amazon DynamoDB: Eventual or strong consistency per-request.
* Apache Cassandra: Highly available, tunable consistency.
* Riak, MongoDB (default mode): High throughput, easy scaling.

--------------------------------------------------------------
# Summary Table

| Consistency Model        | Use Cases                                                                                                      | Tradeoffs                                                                                           | Recommended Databases/Services                                         |
|--------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------|
| **Strict Serializability** | - Financial apps (banking, trading) <br> - Airline/hotel booking <br> - Distributed locks <br> - Legal/compliance systems                        | - High latency <br> - Blocking on network partitions                                                 | Google Spanner, CockroachDB, FoundationDB, Aerospike                   |
| **Serializability**        | - Multi-object business flows <br> - Workflow engines <br> - Intra-bank transfers                                                                | - Protects against anomalies <br> - Allows stale reads <br> - Better throughput than strict serializability | PostgreSQL (Serializable), Oracle, MySQL Group Replication            |
| **Linearizability**        | - Distributed coordination <br> - Counters, IDs <br> - Real-time uniqueness constraints                                                           | - Real-time single-object updates <br> - No multi-object atomicity                                   | etcd, Apache ZooKeeper, Consul                                         |
| **Snapshot Isolation**     | - SaaS apps <br> - CMS platforms <br> - Analytics systems                                                                                         | - High performance <br> - Allows anomalies like write skew                                           | Amazon Aurora, CockroachDB, PostgreSQL (Repeatable Read)              |
| **Eventual Consistency**   | - Social media feeds <br> - DNS, caching <br> - Save-for-later carts                                                                             | - Stale reads, conflict risk <br> - High availability and throughput                                 | DynamoDB, Cassandra, Riak, MongoDB                                     |
