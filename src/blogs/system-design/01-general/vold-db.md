# VoltDB: High-Performance In-Memory Distributed SQL Database

VoltDB is a high-performance, in-memory, distributed SQL database designed for real-time analytics and transaction processing at scale. It was co-founded by Michael Stonebraker, a Turing Award-winning database researcher (who also co-created Ingres, Postgres, and others).

---

## 🧠 What Makes VoltDB Special?

| Feature                | Description                                                                                 |
|------------------------|---------------------------------------------------------------------------------------------|
| 🔥 In-memory storage   | All data is stored in RAM, enabling extremely low-latency access and updates.               |
| ⚡ High throughput     | Designed to handle millions of transactions per second (TPS).                               |
| 🚀 Distributed & partitioned | Horizontally scalable across nodes, with data partitioned for parallel execution.      |
| 💾 Durability          | Uses command logging and snapshots for durability and recovery, despite being in-memory.    |
| ⏱️ Strict serializability | All transactions are ACID-compliant, providing serializable isolation (the strongest level). |
| 🧩 Stored procedures   | All write transactions must be invoked via stored procedures, written in Java.              |
| 🌐 Strong consistency  | Prioritizes strong consistency in distributed environments.                                 |

---

## ✅ Use Cases

- Telco billing systems
- Real-time fraud detection
- Financial transactions (e.g., prepaid balance deduction)
- Online gaming
- IoT/stream processing pipelines (e.g., aggregating sensor data in real-time)

---

## 🔄 MVCC in VoltDB?

VoltDB does **not** use traditional MVCC (Multi-Version Concurrency Control) like PostgreSQL or MySQL. Instead, it avoids concurrency via single-threaded partitions:

- **Each partition is single-threaded:** Transactions that access only one partition are guaranteed to be serial and fast.
- **Multi-partition transactions:** Coordinated centrally with global ordering, still ensuring serializability but with a performance trade-off.

**This model:**
- Removes the need for locks and MVCC
- Prevents most concurrency anomalies by design
- Prioritizes throughput over concurrency granularity

---

## 📌 Summary Table

| Feature            | VoltDB Behavior                                             |
|--------------------|------------------------------------------------------------|
| MVCC               | ❌ Not used                                                 |
| Concurrency Model  | Single-threaded partitions with global coordination        |
| Isolation          | ✅ Serializable (strongest)                                 |
| Durability         | ✅ via snapshots and logs                                   |
| Scalability        | ✅ via partitioning                                         |
| Language Support   | SQL + Java stored procedures                               |



## 💥 Does VoltDB Lose Data on Crash?

| Scenario                                   | What Happens?                                |
|---------------------------------------------|----------------------------------------------|
| Single-node crash without durability enabled| ❌ Data is lost (RAM wiped)                  |
| Crash with replication and command logging  | ✅ Data is automatically recovered           |

---

### 🧠 VoltDB Durability Mechanisms

VoltDB uses a combination of replication, snapshots, and logs to protect against crashes:

#### 1. 🧬 Synchronous Replication

- Each partition has replica nodes (via K-safety or clustered mode)
- If a partition crashes, the replica instantly takes over
- All writes are synchronously committed to both master and replica
- ✅ High availability

#### 2. 💾 Command Logging (WAL-like)

- Every stored procedure execution is logged to disk
- If all nodes crash, VoltDB replays the log on recovery
- ✅ Crash recovery with no data loss

#### 3. 🧹 Periodic Snapshots

- VoltDB supports disk-based snapshots (manual or scheduled)
- Snapshots capture the entire memory state to disk
- Used for fast restore without replaying the entire log
- ✅ Faster recovery than just logs

---

### 🔁 Crash Recovery Workflow

1. Server crashes
2. On restart:
   - Latest snapshot is loaded
   - Command log is replayed from that point
   - Cluster resumes in the exact state before crash

**⏱ Recovery time depends on:**
- Frequency of snapshots
- Size of command log since last snapshot

---

### ⚠️ What If Entire Cluster Fails?

- If command logging is enabled: ✅ Safe
- If no logs or snapshots: ❌ Data is lost

💡 **Always enable both command logging and replication in production.**

---

## 🔐 Summary: Will VoltDB Lose Data on Crash?

| Protection Feature      | Required for Data Durability?         |
|------------------------|---------------------------------------|
| In-memory only         | ❌ Data is lost on crash               |
| Replication (K-safety) | ✅ No data loss on node crash          |
| Command logging enabled| ✅ Recoverable after full crash        |
| Snapshots              | ✅ Speeds up recovery                  |

---

## 🔄 Example Production Setup

```yaml
# 3-node VoltDB cluster
- K-safety = 1 (1 replica per partition)
- Command logging = enabled
- Snapshots every 60 seconds

➤ Crash one node → replica takes over
➤ Crash entire cluster → recover from snapshot + log replay
✅ No data loss
```

---

---

# Migrating from PostgreSQL or SQL Server to VoltDB

If your data currently resides in PostgreSQL or SQL Server and you're considering VoltDB for high-performance, real-time applications, here are the practical things to know:

## 🔁 Migration Considerations: PostgreSQL/SQL Server ➝ VoltDB

| Factor         | PostgreSQL / SQL Server                | VoltDB                                               |
|----------------|----------------------------------------|------------------------------------------------------|
| Use case       | General-purpose OLTP + OLAP            | Real-time, high-throughput OLTP (telco, finance, etc.)|
| Storage        | Disk + optional memory caching         | Fully in-memory                                      |
| Concurrency    | MVCC-based (multi-version rows)        | Single-threaded partitions (no MVCC)                 |
| Isolation      | Multiple levels (Snapshot, Serializable)| Always Serializable                                  |
| Queries        | Ad hoc SQL queries                     | Only parameterized SQL inside Java stored procedures  |
| Joins, Views   | Fully supported                        | Limited support, joins discouraged                   |
| Triggers & Constraints | Supported                      | Very limited                                         |
| Durability     | WAL + checkpoints                      | Command logging + snapshots                          |
| Scaling        | Vertical + horizontal (replication, sharding via Citus or AlwaysOn) | Native horizontal scaling via partitions |

---

### 🔥 When Migration to VoltDB Makes Sense

VoltDB is great only when:

- You have very high throughput and need low latency (<5ms)
- Data can be partitioned cleanly (no frequent cross-partition joins)
- Business logic can be rewritten as stored procedures
- You’re okay with moving from full-featured SQL engines to a specialized execution model

---

## 🧠 Migration Strategy

1. **Schema Design**
   - Flatten or simplify schema (VoltDB discourages deep joins or many-to-many)
   - Remove triggers, views, and constraints
   - Normalize based on performance needs, not theoretical correctness

2. **Data Partitioning**
   - Choose a partitioning key (like `customer_id`, `account_id`) that allows most operations to touch one partition
   - Avoid multi-partition transactions if possible

3. **Stored Procedures**
   - Rewrite all your business logic as Java stored procedures that contain SQL inside
   - No dynamic SQL queries at runtime like `SELECT * FROM users WHERE ...` — must be compiled logic

4. **Data Migration**
   - Export from Postgres/SQL Server using tools like `COPY`, `bcp`, or ETL pipelines
   - Load into VoltDB using CSV, bulk loader, or VoltLoader tools

5. **Durability & Backup**
   - Enable command logging and snapshot scheduling in VoltDB
   - Note: Recovery is based on replay, not undo-redo logs

---

## ⚠️ Things You Will Lose (or Must Redesign)

| Feature                | Not in VoltDB                |
|------------------------|------------------------------|
| Ad hoc queries         | ❌                            |
| Complex joins          | ❌ (only small lookup tables OK) |
| Triggers               | ❌                            |
| External connection pooling | Custom logic required    |
| Long-running analytics | ❌ — use external analytics DB (VoltDB supports export streams to Kafka, Hadoop, etc.) |

---

## ✅ Best Practice: Hybrid Architecture

Instead of replacing your entire system with VoltDB:

- **Use VoltDB as:**
  - The fast-path system for real-time processing
  - Frontline for counters, fraud detection, rate limiting, financial validation
  - A streaming layer (VoltDB supports ingest from Kafka and exports to OLAP databases)

- **Keep PostgreSQL / SQL Server for:**
  - Reporting
  - Historical archiving
  - Complex queries / analytics
  - General-purpose transactions

**Example Architecture:**

```
VoltDB → Export Streams → PostgreSQL (analytics/historical)
```

---

## 📦 Final Advice

| Question                                               | Answer                                                      |
|--------------------------------------------------------|-------------------------------------------------------------|
| Should I move all my SQL Server/Postgres data to VoltDB?| ❌ No — VoltDB is not a full RDBMS replacement              |
| Should I use VoltDB for counters, fraud detection, or high-speed ingestion? | ✅ Absolutely           |
| Can I run VoltDB alongside my existing system?         | ✅ Yes — via CDC, Kafka, ETL                                |

---



*For more, see [VoltDB Documentation](https://docs.voltdb.com/) and [Michael Stonebraker's work](https://en.wikipedia.org/wiki/Michael_Stonebraker).*