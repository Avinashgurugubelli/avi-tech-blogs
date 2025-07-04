<!---
author: "Avinash Gurugubelli",
title: "Column-Oriented Storage Summary",
description: "A concise summary of column-oriented storage, its advantages, and how it works with examples.",
tags: ["Column Storage", "Database Design", "Data Compression", "Bitmap Encoding"],
references: [{
    title: "Designing Data-Intensive Applications",
    authors: ["Martin Kleppmann"],
    publisher: "O'Reilly Media",
    year: 2017,
    url: ""
}]
--->
## What is Column-Oriented Storage?

In **column-oriented storage**, data is stored by **columns instead of rows**.

### Example Table:

| ID | Name  | Age | Country |
| -- | ----- | --- | ------- |
| 1  | John  | 25  | USA     |
| 2  | Alice | 30  | Canada  |
| 3  | Bob   | 28  | UK      |

### Row-Oriented Storage (e.g., PostgreSQL, MySQL):

```
[1, John, 25, USA]
[2, Alice, 30, Canada]
[3, Bob, 28, UK]
```

### Column-Oriented Storage (e.g., ClickHouse, Redshift):

```
ID:      [1, 2, 3]
Name:    [John, Alice, Bob]
Age:     [25, 30, 28]
Country: [USA, Canada, UK]
```

## How Rows are Reconstructed in Column Store?

Even though data is stored column-by-column, each value retains its **position index**, representing the row number:

```
Row 1 = ID[0], Name[0], Age[0], Country[0]
Row 2 = ID[1], Name[1], Age[1], Country[1]
Row 3 = ID[2], Name[2], Age[2], Country[2]
```

**Row identity = its position in every column.**

---

## Query Example: Fetching Specific Rows

```sql
-- Find rows where Age > 28
SELECT * FROM users WHERE Age > 28;
```

1. **Read only the Age column:**

```
Age: [25, 30, 28]
```

Positions matching: `[1, 2]` (i.e., rows 2 and 3)

2. **Fetch values from other columns at positions 1 and 2:**

```
ID: [2, 3]
Name: [Alice, Bob]
Country: [Canada, UK]
```

---

## Advantages of Column-Oriented Storage

| Feature              | Benefit                                        |
| -------------------- | ---------------------------------------------- |
| Fast Aggregation     | Read only required columns for SUM, AVG, etc.  |
| Compression Friendly | Same-type data stored together compresses well |
| Low Disk I/O         | No need to fetch full rows unnecessarily       |

---

## How Compression Works in Column-Oriented Storage

Columnar storage allows for very effective compression because:

1. **Same-Type Values Grouped:** Each column stores a single type of data (e.g., all integers or all strings), allowing specialized compression techniques.

2. **Repetitive Patterns:** If a column has repeated values (e.g., a `Country` column with many 'USA'), the database can use:

   - **Run-Length Encoding (RLE):** Store 'USA x 900' instead of 900 separate 'USA' entries.
   - **Dictionary Encoding:** Replace frequent strings with small integer codes (e.g., 'USA' = 1).

3. **Delta Encoding for Numbers:** For numerical columns, store only differences between consecutive numbers instead of full values.

4. **Low I/O:** Because columns are read independently, only necessary compressed data is fetched and decompressed, saving time and space.

**Example:**

```
Gender: [Male, Male, Male, Female, Female]
RLE Compression: [(Male, 3), (Female, 2)]
```

This approach reduces storage requirements and speeds up queries.

---

## Bitmap Encoding in Column-Oriented Storage

Bitmap encoding is another popular compression technique, especially effective for low-cardinality columns (columns with few distinct values).

### Explanation of Bitmap Length:

The **length of each bitmap vector** equals the **number of rows in the column**. This is because each bit in the vector represents the presence (`1`) or absence (`0`) of that specific value **at each row position**.

For example, if a column has 8 data entries, then **each bitmap will have 8 bits**, one for each row index.

### Example:

Bitmap encoding is another popular compression technique, especially effective for low-cardinality columns (columns with few distinct values).

### Example:

```
Data: [29, 30, 49, 26, 19, 26, 49, 26]
```

### Distinct values:

```
[19, 26, 29, 30, 49]
```

### Bitmap Vectors:

| Value | Bitmap            |
| ----- | ----------------- |
| 19    | [0 0 0 0 1 0 0 0] |
| 26    | [0 0 0 1 0 1 0 1] |
| 29    | [1 0 0 0 0 0 0 0] |
| 30    | [0 1 0 0 0 0 0 0] |
| 49    | [0 0 1 0 0 0 1 0] |

### Query Example:

Find rows where value = 26 or 49:

```
26: [0 0 0 1 0 1 0 1]
49: [0 0 1 0 0 0 1 0]
OR : [0 0 1 1 0 1 1 1]
```

Positions with '1' indicate matches: rows **2, 3, 5, 6, 7** (0-based indexing).

#### Important Notes:

- **Bitmap encoding is not based on binary division or number representation.**
- It uses position-based bitmaps where each bit represents the **presence or absence** of that value in the row.
- Works best for **low-cardinality** data (few unique values).

### Sparse Bitmaps and Compression:

In real-world scenarios, if the number of distinct values `n` is large compared to the number of rows, the bitmaps can become **sparse** (mostly zeros). In such cases, databases apply additional compression methods, like **Run-Length Encoding (RLE)**, to compress these sparse bitmaps efficiently. This makes storage very compact while still allowing fast bitwise operations.

Bitmap indexes are extremely well-suited for analytical queries, especially those common in data warehouses, such as:

- **OR queries:**

```
WHERE product_sk IN (30, 68, 69)
```

Here, the system loads the bitmaps for `product_sk = 30`, `68`, and `69`, then performs a fast bitwise OR.

- **AND queries:**

```
WHERE product_sk = 31 AND store_sk = 3
```

Here, it loads two separate bitmaps and performs a fast bitwise AND operation. Since all column bitmaps follow the same row order, the kth bit in every bitmap refers to the same row.

---

## Disadvantages

| Limitation       | Explanation                                  |
| ---------------- | -------------------------------------------- |
| Slow Row Inserts | Must update multiple files (columns)         |
| Poor for OLTP    | Not designed for transaction-heavy workloads |

---

## Real-World Usage

| Use Case                        | Column Store? |
| ------------------------------- | ------------- |
| Analytical Queries (OLAP)       | ✅ Yes         |
| Transactional Systems (OLTP)    | ❌ No          |
| Business Intelligence Reporting | ✅ Yes         |

---

## Popular Column-Oriented Databases

| Database/Product     | Columnar? |
| -------------------- | --------- |
| PostgreSQL (default) | ❌ No      |
| MySQL (default)      | ❌ No      |
| Amazon Redshift      | ✅ Yes     |
| Apache Parquet       | ✅ Yes     |
| ClickHouse           | ✅ Yes     |
| DuckDB               | ✅ Yes     |
| Google BigQuery      | ✅ Yes     |

---

## Additional Example: PostgreSQL with Column Store Extension

```sql
CREATE EXTENSION cstore_fdw; -- Column-store extension for Postgres
```

---

## Summary Table

| Feature           | Row-Oriented Store | Column-Oriented Store         |
| ----------------- | ------------------ | ----------------------------- |
| Insert/Update     | Fast               | Slow (multi-column writes)    |
| Aggregation Speed | Slow               | Fast (reads only needed cols) |
| Compression       | Medium             | High                          |
| OLTP Suitability  | ✅ Yes              | ❌ No                          |
| OLAP Suitability  | ❌ No               | ✅ Yes                         |

---

## Conclusion

- **Column-oriented storage** is ideal for analytics, BI, and read-heavy queries.
- **Row-oriented storage** is better for transaction processing, frequent inserts/updates.
- Some systems (like PostgreSQL) can be extended to support columnar storage using plugins like `cstore_fdw`.

---

**Prepared by ChatGPT — June 2025**

