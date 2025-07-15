<!--
title: "Pessimistic vs Optimistic Concurrency Control",
description: "A detailed comparison of pessimistic and optimistic concurrency control methods in database transactions, including their use cases, advantages, and disadvantages.
author: "Avinash Gurugubelli"
tags: [
  "Concurrency Control",
  "Pessimistic Concurrency Control",
  "Optimistic Concurrency Control"
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

### Pessimistic vs Optimistic Concurrency Control

- **Pessimistic Concurrency Control**: Involves locking resources to prevent conflicts between transactions. It is suitable for scenarios with high contention and where conflicts are expected.
  
- **Optimistic Concurrency Control**: Involves allowing transactions to proceed without locking resources, but validating conflicts before committing. It is suitable for scenarios with low contention and where conflicts are rare.
- **Example**:
    - Pessimistic: Using 2PL to lock rows during a transaction.
    - Optimistic: Using SSI to read a snapshot and validate conflicts before committing.
    - **When to Use**:
        - Pessimistic: When contention is high and conflicts are expected.
        - Optimistic: When contention is low and conflicts are rare.
        - **Trade-offs**:
            - Pessimistic: Higher overhead due to locking, but guarantees isolation.
            - Optimistic: Lower overhead, but requires conflict detection and resolution.
- SQL Example:
    - Pessimistic: Using SELECT FOR UPDATE to lock rows during a transaction.
  
        ```sql
        BEGIN TRANSACTION;
        SELECT * FROM Accounts WHERE id = 1 FOR UPDATE; -- Acquire lock
        UPDATE Accounts SET balance = balance - 100 WHERE id = 1; -- Write to snapshot
        SELECT * FROM Accounts WHERE id = 2 FOR UPDATE; -- Acquire lock
        UPDATE Accounts SET balance = balance + 100 WHERE id = 2; -- Write to snapshot
        COMMIT; -- Release locks
        ```

    - Optimistic: Using a version column to detect conflicts before committing. 
      ```sql
      BEGIN TRANSACTION;
      SELECT * FROM Accounts WHERE id = 1; -- Read from snapshot
      UPDATE Accounts SET balance = balance - 100, version = version + 1 WHERE id = 1 AND version = 1; -- Write to snapshot with version check
      IF ROW_COUNT() = 0 THEN
          ROLLBACK; -- Conflict detected, abort transaction
      ELSE
          COMMIT; -- No conflict, commit changes
      END IF;
      ```