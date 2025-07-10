<!--
author: "Avinash Gurugubelli",
title: "Transactions in Databases: ACID, Single vs Multi-Object Operations Explained",
description: "A beginner-friendly introduction to ACID properties, the meaning of transactions, and the difference between single-object and multi-object operations in modern databases.",
tags: [
  "ACID",
  "Transactions",
  "Atomicity",
  "Consistency",
  "Isolation",
  "Durability",
  "Single-Object Transactions",
  "Multi-Object Transactions",
  "Distributed Databases",
  "System Design",
  "Database Consistency"
],
references: [{
  title: "Designing Data-Intensive Applications",
  authors: ["Martin Kleppmann"],
  publisher: "O'Reilly Media",
  year: 2017,
  url: "https://dataintensive.net/"
}]
-->

# 💾 Transactions in Databases: What Every Developer Should Know

In modern applications, databases play a crucial role in ensuring that data is stored, updated, and retrieved reliably. One of the key concepts that makes this possible is the **transaction**.

Whether you're transferring money, placing an order, or updating a user profile, transactions ensure that everything works as expected — even when things go wrong. But what exactly is a transaction? And why are terms like **ACID**, **consistency**, and **atomicity** so important?

Let’s break it down.

---

## ⚠️ What Is a Transaction, Really?

Traditionally, a **transaction** is thought of as a reliable, all-or-nothing operation. But in recent years, especially with the rise of **NoSQL databases**, the meaning of "transaction" has started to shift.

Many modern databases **relax or redefine** the strict guarantees offered by traditional relational databases. This is often done to improve performance, scale across many servers, or increase availability — but it also means developers need to understand the trade-offs.

---

## 🔐 The ACID Properties of Transactions

The term **ACID** is an acronym that summarizes the four key guarantees that database transactions strive to offer:

### 1. 🧱 Atomicity
> All or nothing.

A transaction must either **complete entirely** or **not happen at all**. If something goes wrong halfway through, all changes are undone — like hitting "undo" in your editor. This prevents partial updates that could leave your data in an inconsistent state.

### 2. ✅ Consistency
> Data must remain valid.

The database should always move from one **valid state** to another. For example, if you're transferring money from one account to another, the total balance should remain the same. While the application is responsible for defining these rules, the database ensures they’re preserved during failures and concurrency.

### 3. 🧩 Isolation
> Transactions shouldn’t interfere with each other.

Even when multiple users are updating data at the same time, each transaction should appear to run **independently**. The ideal is **serializability** — making concurrent transactions behave as if they ran one after another. In practice, many systems use lighter versions of isolation to boost speed.

### 4. 💾 Durability
> Once saved, always saved.

If a transaction is successfully committed, the data **won’t be lost** — even if the system crashes or the power goes out. This is achieved by saving changes to persistent storage (like a hard drive), and often using techniques like logging or backups for extra safety.

---

## 🧠 Single-Object vs. Multi-Object Transactions

### ⚙️ Single-Object Operations

Many modern (especially NoSQL) databases only offer strong guarantees for **single items** — such as one document or one key-value pair. These are fast and simple but come with limitations.

**Example – Single-Object:**

Updating a user’s balance:

```sql
UPDATE Users
SET balance = balance - 100
WHERE user_id = 123;
```

- Only one row in one table is being updated.
- Most databases can guarantee atomicity and isolation for this operation.

---

### 🔄 Multi-Object Transactions

Now let’s say you need to transfer money between two users — deduct from one and add to another.

**Example – Multi-Object:**

```sql
BEGIN;

UPDATE Users
SET balance = balance - 100
WHERE user_id = 123;  -- User A

UPDATE Users
SET balance = balance + 100
WHERE user_id = 456;  -- User B

COMMIT;
```

- This operation affects **two rows** and must **succeed or fail as a unit**.
- If the first update succeeds but the second fails, the system may become inconsistent.
- This is a **multi-object transaction** and requires support from the database engine to be truly atomic.

---

### 🧠 Real-World Complexity

If the updates span:
- Different tables (e.g., `Users` and `Transactions`)
- Separate database partitions or shards
- Distinct microservices (e.g., account service and ledger service)

Then the transaction becomes **distributed**, requiring advanced coordination mechanisms such as:
- Two-Phase Commit (2PC)
- Saga Patterns (with compensation logic)

---

## 🧭 Why It Matters

As systems grow more distributed and data is spread across many machines, **the traditional ideas of transactions are being challenged**. While relaxing guarantees can boost performance and scalability, it also means you need to understand **what your database does — and doesn’t — guarantee**.

When building applications that involve important or interdependent updates (like financial systems, inventory management, or collaborative apps), knowing how transactions work — and how your database handles them — is essential.

---

> 💡 **Tip for Developers**: Always check what kind of transaction support your database provides. Don’t assume full ACID guarantees unless they’re explicitly documented.
