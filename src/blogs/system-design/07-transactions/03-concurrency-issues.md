<!--
author: "Avinash Gurugubelli",
title: "Common Concurrency Issues in Database Transactions",
description: "A practical guide to understanding Lost Updates, Write Skew, and Phantom Reads — with real SQL examples, fixes using locking, atomic operations, optimistic concurrency control, and isolation levels like Serializable and Snapshot Isolation.",
tags: [
  "Database Concurrency",
  "Lost Updates",
  "Write Skew",
  "Phantom Reads",
  "Snapshot Isolation",
  "Serializable Isolation",
  "Optimistic Locking",
  "Pessimistic Locking",
  "PostgreSQL",
  "SQL Server",
  "System Design",
  "Database Transactions",
  "MVCC",
  "Isolation Levels"
],
references: [{
  title: "Designing Data-Intensive Applications",
  authors: ["Martin Kleppmann"],
  publisher: "O'Reilly Media",
  year: 2017,
  url: "https://dataintensive.net/"
}]
-->


# 🔄 Common Concurrency Issues in Database Transactions

Modern applications often deal with concurrent users modifying the same data. Even with isolation levels, some concurrency issues like **Lost Updates**, **Write Skew**, and **Phantom Reads** can still occur — silently causing data corruption or business logic failures.

---

## 1️⃣ ❌ Lost Updates

**Lost updates** occur when two transactions perform a read–modify–write operation concurrently on the same data, and one update is silently overwritten by the other.

### 🔥 Real-World Example

Two users transfer money from the same account:

```sql
-- T1 reads balance = 100
-- T2 reads balance = 100

-- T1 updates: balance = 100 - 20 = 80
UPDATE accounts SET balance = 80 WHERE id = 1;

-- T2 updates: balance = 100 - 30 = 70 (overwrites T1)
UPDATE accounts SET balance = 70 WHERE id = 1;
```

> Final balance = **70**, but **T1’s update is lost**.
---

### 🛠️ Solutions to Prevent Lost Updates

#### ✅ 1. Atomic Update ((Recommended for Counters/Balance))

Let the database handle the math in a single UPDATE statement so there's no read-modify-write gap:

```sql
-- Deduct 20 from balance
UPDATE accounts
SET balance = balance - 20
WHERE id = 1;
```

This approach ensures:
 - No race conditions
 - Always correct final value
 - Works even with concurrent updates

---

#### ✅ 2. Explicit Locking (Pessimistic Concurrency)

Lock the row before reading or modifying it:

```sql
BEGIN;

SELECT balance FROM accounts
WHERE id = 1
FOR UPDATE;

UPDATE accounts
SET balance = balance - 20
WHERE id = 1;

COMMIT;
```

This prevents concurrent transactions from reading/modifying the same row simultaneously.

---

#### ✅ 3. Optimistic Concurrency Control (Version Checking / Compare-and-Set)

- Assume no conflict, but check version before update:
- Add a version column to your table, and only update if the row hasn't changed since you read it.

```sql
-- Read balance and version
SELECT balance, version FROM accounts WHERE id = 1;

-- Conditionally update
UPDATE accounts
SET balance = 80, version = version + 1
WHERE id = 1 AND version = 3;
```
- If the version changed (i.e., someone else updated), this update will affect 0 rows
- The transaction must then retry with fresh data
---

#### ✅ 4. Serializable Isolation

Let the DB detect and reject concurrent conflicts:

```sql
BEGIN ISOLATION LEVEL SERIALIZABLE;

SELECT balance FROM accounts WHERE id = 1;
UPDATE accounts SET balance = 80 WHERE id = 1;

COMMIT;
```
- If another transaction modified balance, your COMMIT will fail with a serialization error.
- You must retry the transaction.


---

### 🧪 Affected Isolation Levels

| Isolation Level       | Lost Updates Possible? |
|------------------------|-------------------------|
| Read Committed         | ✅ Yes                 |
| Snapshot Isolation     | ✅ Sometimes (unless DB detects write-write conflicts) |
| Serializable           | ❌ No                  |

---

### ✅ Prevention Techniques

| Technique             | Description |
|------------------------|-------------|
| **Atomic Updates**     | Let DB perform updates directly using arithmetic: <br> `UPDATE accounts SET balance = balance - 100 WHERE id = 1;` |
| **Explicit Locking**   | Use `SELECT ... FOR UPDATE` before modifying data |
| **Optimistic Concurrency** | Add version column: <br> `UPDATE ... WHERE version = :v;` <br> Retry if 0 rows updated |
| **Serializable Isolation** | Prevents all conflicting writes |

---

## 2️⃣ ⚠️ Write Skew

**Write skew** happens when two transactions read the same consistent snapshot, make decisions based on it, and update **different rows**, but their combined actions violate a business constraint.

---

### 🏥 Real-World Example: Doctor On-Call

- Rule: **At least one doctor must be on call per shift**
- Initial state:

| Doctor | OnCall | Shift |
|--------|--------|-------|
| Alice  | true   | 123   |
| Bob    | true   | 123   |

#### Problem:
- T1 (Alice) sees both on call, sets herself to off-duty
- T2 (Bob) sees both on call, sets himself to off-duty
- Both commit

> Final state: **No doctors on call** — violates business rule.

---

### 📚 SQL Solution

```sql
BEGIN;
-- Lock all on-call doctors
SELECT * FROM doctors 
WHERE on_call = true AND shift_id = 123 
FOR UPDATE;

-- Validate constraint
SELECT COUNT(*) FROM doctors 
WHERE on_call = true AND shift_id = 123;

-- Proceed only if ≥ 2
UPDATE doctors SET on_call = false 
WHERE doctor_id = 456 AND shift_id = 123;

COMMIT;
```

---

### 🧪 Affected Isolation Levels

| Isolation Level       | Write Skew Possible? |
|------------------------|------------------------|
| Read Committed         | ✅ Yes                |
| Snapshot Isolation     | ✅ Yes                |
| Serializable           | ❌ No                 |

---

### ✅ Prevention Techniques

| Technique                    | Use When...                            |
|------------------------------|----------------------------------------|
| Serializable Isolation       | You want automatic protection          |
| Lock all dependent rows      | Use `SELECT FOR UPDATE` manually       |
| Materialized conflict rows   | Lock explicit time slots, IDs, etc.    |
| Application constraints      | Use logic/triggers to enforce business rules |

---

### 🛏️ Meeting Room Booking Example

#### Problem:
- Two users see the room is free for 2–3 PM
- Both insert booking
- Double booking occurs

#### Serializable Solution:

```sql
BEGIN ISOLATION LEVEL SERIALIZABLE;

-- Check if slot taken
SELECT 1 FROM bookings 
WHERE room_id = 101 
  AND time_range && '[2023-01-01 14:00, 2023-01-01 15:00)';

-- If no conflicts:
INSERT INTO bookings (...) VALUES (...);
COMMIT;
```

#### Materialized Locking:
- If the problem of phantoms is that there is no object to which we can attach the locks, perhaps we can artificially introduce a lock object into the database?
- For example, in the meeting room booking case you could imagine creating a table of time slots and rooms. Each row in this table corresponds to a particular room for a particular time period (say, 15 minutes). You create rows for all possible combinations of rooms and time periods ahead of time, e.g. for the next six months.

- Now a transaction that wants to create a booking can lock (SELECT FOR UPDATE) the rows in the table that correspond to the desired room and time period. After it has acquired the locks, it can check for overlapping bookings and insert a new booking as before. Note that the additional table isn’t used to store information about the booking —it’s purely a collection of locks which is used to prevent bookings on the same room and time range from being modified concurrently.
This approach is called **materializing conflicts**

- Unfortunately, it can be hard and error-prone to figure out how to materialize conflicts, and it’s ugly to let a concurrency control mechanism leak into the application data model. For those reasons, materializing conflicts should be considered a last resort if no alternative is possible. A serializable isolation level is much preferable in most cases.

```sql
BEGIN;

-- Lock the slot explicitly
SELECT * FROM room_time_slots
WHERE room_id = 101 AND slot = '2023-01-01 14:00-15:00'
FOR UPDATE;

-- Proceed with booking
INSERT INTO bookings (...) VALUES (...);
COMMIT;
```

---

## 3️⃣ 👻 Phantom Reads

A **phantom read** happens when a transaction reads a set of rows, another transaction inserts/deletes rows that match the query condition, and the original transaction reads a **different result** if re-run.

---

### 📦 Inventory or Room Booking Example

- T1: `SELECT * FROM bookings WHERE slot = '2-3pm'` → no rows
- T2 inserts a booking for the same time
- T1 proceeds assuming it’s available → conflict

---

### ✅ Prevention Techniques

| Technique                    | Description |
|------------------------------|-------------|
| Serializable Isolation       | Prevents phantom rows via predicate locks |
| Materialized Rows            | Create and lock rows ahead of time         |
| Range locks / Gap locks      | Some DBs like InnoDB can lock ranges       |

---

## 🧠 General Prevention Patterns

| Pattern                  | Best For                          |
|---------------------------|-----------------------------------|
| **Pessimistic Locking**   | Business rules needing exact control (`SELECT FOR UPDATE`) |
| **Atomic Operations**     | Counters, balance updates, inventory |
| **Unique Constraints**    | Username/email registration, slugs |
| **Optimistic Concurrency**| High-throughput systems, retries |
| **Serializable Isolation**| Complex multi-row business rules |

---

## 📌 Key Takeaways

- **Lost Updates** and **Write Skew** are dangerous concurrency problems.
- **Read Committed** and **Snapshot Isolation** don't fully prevent them.
- Use a combination of:
  - Explicit locking
  - Atomic updates
  - Optimistic version checks
  - Application-level validation
  - Serializable isolation when safety is critical

---

> 🧠 **Concurrency control is not just a database config — it's part of application design.**
> 
> Understand your data dependencies and choose the right isolation & consistency strategy for your use case.