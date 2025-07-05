<!--
author: "Avinash Gurugubelli",
title: "Partition Rebalancing Strategies: More Examples",
description: "Explore how distributed databases rebalance partitions under node addition/removal scenarios using fixed, dynamic, and proportional strategies. Includes even and odd partition count examples with visualizations.",
tags: [
  "Partitioning",
  "Sharding",
  "Distributed Databases",
  "System Design",
  "Secondary Indexes",
  "Hash Partitioning",
  "Range Partitioning",
  "Rebalancing",
  "Consistent Hashing",
  "Partition Splitting",
  "Load Balancing"
],
references: [{
  title: "Designing Data-Intensive Applications",
  authors: ["Martin Kleppmann"],
  publisher: "O'Reilly Media",
  year: 2017,
  url: "https://dataintensive.net/"
}]
-->


# Partition Rebalancing: Handling Even & Odd Counts

## 📌 1. Fixed Number of Partitions

### ✅ Even Count Example (4 nodes, 8 partitions)
**Before Removal:**
```plaintext
Node 0: p0, p4      Node 1: p1, p5
Node 2: p2, p6      Node 3: p3, p7
```

**After Removing Node 3:**
```plaintext
Node 0: p0, p3, p4  Node 1: p1, p5
Node 2: p2, p6, p7  # p3/p7 redistributed
```

---

### ⚠️ Odd Count Example (3 nodes, 7 partitions)
**Before Removal:**
```plaintext
Node 0: p0, p3, p6  Node 1: p1, p4
Node 2: p2, p5
```

**After Removing Node 2:**
```plaintext
Node 0: p0, p3, p5, p6  Node 1: p1, p2, p4  # p2/p5 moved
```

**Behavior:**
- Empty partitions remain (no merging).
- Odd counts cause temporary imbalance.

---

## 🔄 2. Dynamic Partitioning

### ✅ Even Count Example (4 nodes, 8 partitions)
**Before Merging:**
```plaintext
Node 0: A(2GB), B(2GB)  Node 1: C(2GB), D(2GB)
Node 2: E(2GB), F(2GB)  Node 3: G(2GB), H(2GB)
```

**After Removing 2 Nodes:**
```plaintext
Node 0: A+B(4GB), C+D(4GB)  
Node 1: E+F(4GB), G+H(4GB)  # Merged pairs
```

---

### ⚠️ Odd Count Example (3 nodes, 5 partitions)
**Before Merging:**
```plaintext
Node 0: A(3GB), B(1GB)  Node 1: C(2GB)
Node 2: D(1GB), E(1GB)
```

**After Removing Node 2:**
```plaintext
Node 0: A(3GB), B+D(2GB)  Node 1: C(2GB), E(1GB)  
# Small partitions merged
```

**Behavior:**
- Automatically merges small/adjacent partitions.
- Odd counts handled via flexible sizing.

---

## ⚖️ 3. Partition Proportional to Nodes (Cassandra-style)

### ✅ Even Count Example (4 nodes, 8 partitions)
**Before Removal:**
```plaintext
Node 0: p0, p1      Node 1: p2, p3
Node 2: p4, p5      Node 3: p6, p7
```

**After Removing Node 3:**
```plaintext
Node 0: p0, p1, p6  Node 1: p2, p3, p7  
Node 2: p4, p5       # p6/p7 redistributed
```

---

### ⚠️ Odd Count Example (3 nodes, 5 partitions)
**Before Removal:**
```plaintext
Node 0: p0, p1      Node 1: p2, p3  
Node 2: p4
```

**After Removing Node 2:**
```plaintext
Node 0: p0, p1, p4  Node 1: p2, p3  
# p4 moved to Node 0 (temporary imbalance)
```

**Final Rebalance (After Splits/Merges):**
```plaintext
Node 0: p0, p1'     Node 1: p2, p3, p4'  
# p1 split to p1+p1', p4 split to p4+p4'
```

**Behavior:**
- Splits largest partitions to balance odd counts.
- Background processes merge splits later.

---

## 📊 Comparison Table

| Strategy     | Even Count Handling     | Odd Count Handling                     |
|--------------|--------------------------|-----------------------------------------|
| **Fixed**    | Redistributes evenly     | Leaves temporary imbalance              |
| **Dynamic**  | Merges pairs cleanly     | Flexible merging of small partitions    |
| **Proportional** | Reassigns + splits   | Splits largest partitions first         |

---

## ✅ Key Takeaways

1. **Fixed**: Simple but inefficient for odd counts.  
2. **Dynamic**: Best for variable data sizes.  
3. **Proportional**: Tolerates imbalance temporarily with eventual convergence.
