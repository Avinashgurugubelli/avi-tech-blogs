<!---
author: "Avinash Gurugubelli",
title: "Predicate Locks vs Index Range Locks — Comparison & Use Cases",
description: "A detailed comparison of Predicate Locks and Index Range Locks in database transactions, including when to use each type, their advantages, and practical examples.",
tags: [
  "Database Transactions",
  "Predicate Locks",
  "Index Range Locks",
  "ACID Properties",
  "System Design",
  "Concurrency Control",
  "Database Isolation Levels",
  "SQL",
  "Database Locking"
  ],
  references: [{
    title: "Designing Data-Intensive Applications",
    authors: ["Martin Kleppmann"],
    publisher: "O'Reilly Media",
    year: 2017,
    url: "https://dataintensive.net/"
  }]

date: 2023-10-01
-->

# Predicate Locks vs Index Range Locks — Comparison & Use Cases

## 🔐 Overview

| Feature           | **Predicate Locks**                                            | **Index Range Locks**                                             |
| ----------------- | -------------------------------------------------------------- | ----------------------------------------------------------------- |
| **What it locks** | Logical conditions (e.g., `WHERE balance > 100`)               | Physical range of index entries (based on index values)           |
| **When used**     | Serializable isolation level (esp. with **predicate queries**) | Serializable or repeatable read with **indexed access**           |
| **Prevents**      | **Phantom reads** by locking matching (and would-match) rows   | **Phantom reads**, but only if an **index** is used in query plan |
| **Granularity**   | Logical — not tied to specific rows/indexes                    | Tied to B-Tree index structure (exact range of keys locked)       |
| **Overhead**      | Higher (because the system must track logical conditions)      | Lower (more efficient via index structures)                       |
| **DB Support**    | PostgreSQL (Serializable Snapshot Isolation), Oracle           | MySQL (InnoDB), SQL Server, Oracle                                |

---

## ✅ Use **Predicate Locks** when:

* You query rows using a **condition not backed by an index**.
* The database uses **Serializable Snapshot Isolation (SSI)** and must **logically lock all potential matches**, not just existing rows.
* You want **safety over performance**.

### 🧠 Example 1 — Unindexed condition

```sql
-- Transaction A
SELECT * FROM employees WHERE salary > 100000;

-- Locks all current and potential rows where salary > 100000.
-- Even if someone inserts a new employee with salary = 120000, it will block or fail.
```

### 🧠 Example 2 — Dynamic Category Check

```sql
-- Transaction A
SELECT * FROM products WHERE category = 'Electronics' AND price > 1000;

-- Transaction B attempts:
INSERT INTO products(name, category, price) VALUES ('New iPhone', 'Electronics', 1200);
-- May be blocked — new row matches predicate
```

---

## ✅ Use **Index Range Locks** when:

* Your queries **filter on indexed columns**.
* You want efficient prevention of **phantom inserts** within a range.
* You're working in systems like **MySQL (InnoDB)** with **Repeatable Read / Serializable**.

### 🧠 Example 1 — Indexed range condition

```sql
-- Transaction A
SELECT * FROM orders WHERE order_date BETWEEN '2025-01-01' AND '2025-01-31' FOR SHARE;

-- Locks all index entries in that date range.
-- Prevents Transaction B from inserting new orders with dates in that range.
```

### 🧠 Example 2 — Booking System

```sql
-- Indexed column: room_id

-- Transaction A (holds index range lock)
SELECT * FROM bookings WHERE room_id BETWEEN 100 AND 110 FOR UPDATE;

-- Transaction B tries:
INSERT INTO bookings(room_id, date) VALUES (105, '2025-08-01');
-- BLOCKED: 105 is in the locked index range
```

### 🧠 Example 3 — Account Balance Transfer

```sql
-- Indexed by account_id

-- Transaction A
SELECT * FROM accounts WHERE account_id BETWEEN 500 AND 600 FOR UPDATE;

-- Transaction B
INSERT INTO accounts(account_id, balance) VALUES (550, 2000);
-- BLOCKED or fails due to range lock on account_id
```

---

## 🧭 When to Use Which?

| Scenario                                         | Recommended Lock Type |
| ------------------------------------------------ | --------------------- |
| No index on filtered column                      | Predicate Lock        |
| Indexed column + range condition                 | Index Range Lock      |
| Prevent phantom reads in complex filters         | Predicate Lock        |
| Efficient protection in B-Tree index-based DBs   | Index Range Lock      |
| Using PostgreSQL Serializable Snapshot Isolation | Predicate Lock        |
| Using MySQL (InnoDB) with Repeatable Read        | Index Range Lock      |

---

Let me know if you want a visual diagram or animated flow to better understand how these locks behave internally!
