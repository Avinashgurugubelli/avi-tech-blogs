<!--
author: "Avinash Gurugubelli",
title: "🧬 How MVCC Tracks Row Versions Internally",
description: "A deep dive into how MVCC (Multi-Version Concurrency Control) works in modern databases, including row versioning, logical deletes, garbage collection, and MVCC internals in PostgreSQL, MySQL, Oracle, and SQL Server.",
tags: [
  "MVCC",
  "Snapshot Isolation",
  "Database Internals",
  "Concurrency Control",
  "PostgreSQL",
  "MySQL",
  "Oracle",
  "SQL Server",
  "VACUUM",
  "Undo Logs",
  "Versioning",
  "Garbage Collection",
  "System Design",
  "Transactions"
],
references: [{
  title: "Designing Data-Intensive Applications",
  authors: ["Martin Kleppmann"],
  publisher: "O'Reilly Media",
  year: 2017,
  url: "https://dataintensive.net/"
}]
-->

## 🧬 How MVCC Tracks Row Versions Internally

In MVCC (Multi-Version Concurrency Control), rows in a database table are **not overwritten** during updates or deletes. Instead, **each version of a row is tracked separately**, allowing concurrent transactions to read consistent snapshots without blocking.


![](../../images/SnapShotIsolationMVCC.png)

---

### 🧾 Metadata on Each Row

Every row in the database typically contains:

- `created_by`: The **transaction ID** that inserted this row.
- `deleted_by`: Initially empty. Set to the **transaction ID** that later deleted or replaced this row.

---

### 🔁 What Happens During a DELETE?

When a transaction deletes a row:

- The row is **not immediately removed**.
- Instead, its `deleted_by` field is set to that transaction’s ID.
- This marks the row as “logically deleted,” but it **remains visible** to transactions that started before the deletion.

---

### 🔄 What Happens During an UPDATE?

An `UPDATE` is handled as:

1. A **logical DELETE** of the old version (sets `deleted_by`)
2. An **INSERT** of a new row version (with updated values, and a new `created_by`)

So, an update creates **two versions** of the same logical row:
- The **old version** (marked as deleted)
- The **new version** (inserted by the updating transaction)

---

### 🧪 Example: Updating Account Balance

Let’s say `Transaction 13` deducts `$100` from **Account 2**, changing the balance from `$500` to `$400`.

Under MVCC, the table will now contain:

| Account ID | Balance | Created By | Deleted By |
|------------|---------|------------|-------------|
| 2          | 500     | T10        | T13         |
| 2          | 400     | T13        | *(null)*    |

- The old version (`$500`) was **created by T10** and **deleted by T13**.
- The new version (`$400`) was **created by T13** and is the current visible row.

---

### 🧹 Garbage Collection (MVCC Cleanup)

Eventually, when **no active transaction** can still see the old/deleted row, the database will:

- Run a **garbage collection process** (e.g., `VACUUM` in PostgreSQL)
- **Permanently remove** those old/dead row versions
- **Free up space** on disk

This ensures that MVCC doesn't cause **unbounded data growth** over time.

---

💡 This approach allows:
- **Readers to see a consistent snapshot**, even while writers update data.
- **Writers to make changes** without blocking readers.
- The database to remain **highly concurrent and scalable**.


### 🔍 Where Are MVCC Versions Stored ?
| Database           | MVCC Version Storage                               | Location                   |
| ------------------ | -------------------------------------------------- | -------------------------- |
| **PostgreSQL**     | Row versions inline in the table (called **heap**) | **Disk**                   |
| **MySQL (InnoDB)** | Uses **undo logs** to reconstruct old versions     | **Disk (Undo Tablespace)** |
| **Oracle**         | Uses **rollback segments** (similar to undo logs)  | **Disk (Undo Segments)**   |
| **SQL Server**     | Uses **version store** in **tempdb**               | **Disk + RAM (tempdb)**    |


## 🧹 How Are Old Versions Cleared in MVCC?

Since **MVCC (Multi-Version Concurrency Control)** stores multiple versions of rows to allow non-blocking reads and writes, databases need a way to **clean up old versions** when they're no longer needed.

Here’s how major databases handle it:

---

### ✅ PostgreSQL — VACUUM

- PostgreSQL keeps old row versions (called **dead tuples**) so that older transactions can still read them.
- These are cleared using the **VACUUM** process.

#### 🔄 VACUUM Process:
- Runs **automatically** in the background (`autovacuum`)
- Can also be run **manually** with the `VACUUM` command
- Frees disk space and maintains index health

> **Note:** PostgreSQL **never overwrites rows** on `UPDATE` or `DELETE`. Instead, it creates a **new version**, and `VACUUM` later cleans the old one.

---

### ✅ MySQL (InnoDB) — Undo Log Cleanup

- InnoDB uses **undo logs** to keep old versions of rows.
- These logs are stored on **disk**, not memory.

#### 🔄 Cleanup Mechanism:
- When no transaction needs the old data anymore, InnoDB’s **purge thread** automatically re

---

## 🧠 Summary Table

| Database       | MVCC Storage             | Cleanup Mechanism            |
|----------------|--------------------------|-------------------------------|
| PostgreSQL     | Dead tuples in table     | `VACUUM` / `autovacuum`       |
| MySQL (InnoDB) | Undo logs                | Background purge thread       |
| Oracle         | Undo segments            | Auto reuse (may error early)  |
| SQL Server     | `tempdb` version store   | Automatic cleanup             |

---