<!--
author: "Avinash Gurugubelli",
title: "The Troubles of Distributed Systems",
description: "This blog discusses the common challenges faced in distributed systems, including network issues, data consistency, and fault tolerance.",
tags: [
  "Distributed Systems",
  "Network Issues",
  "Data Consistency",
  "Fault Tolerance",
  "System Design",
  "Network Partitioning
],
references: [{
  title: "Designing Data-Intensive Applications",
  authors: ["Martin Kleppmann"],
  publisher: "O'Reilly Media",
  year: 2017,
  url: "https://dataintensive.net/"
}]
-->

## Introduction
This blog focuses on the inherent challenges of distributed systems: partial failures, unreliable networks, time/clock issues, and distributed consensus

### 1. Partial Failure in Distributed Systems
Key idea: In distributed systems, individual components may fail, while others function—this is called partial failure. Such failures can lead to "split brain" or inconsistent views of the system.

```mermaid
graph TD
    subgraph Distributed System
    A[Node 1] -->|Heartbeat| B[Node 2]
    A -->|Heartbeat| C[Node 3]
    B -->|Heartbeat| C
    end

    subgraph Partial Failure Scenario
    D[Network Partition] -->|Blocks communication| A
    D -->|Allows communication| B
    D -->|Allows communication| C
    end

    subgraph Consequences
    E[Split Brain]
    F[Inconsistent State]
    G[Conflicting Decisions]
    end

    A -.->|Cannot communicate| B
    B -->|Elects new leader| C
    A -->|Still considers itself leader| E
    E --> F
    E --> G
```
Diagram: Network partition causes two parts of a cluster to become isolated—each may believe they are still operating normally.

Solution: Use consensus algorithms like Paxos or Raft to ensure that only one leader is elected, even in the presence of network partitions.

### 2. Unreliable Networks
Key idea: Networks can be unreliable, leading to message loss, duplication, or reordering.
This can cause inconsistencies in data and complicate communication between distributed components.


Networks face variable delays due to:
- Queueing: Packets wait in buffers at switches/OS.
- TCP Retransmissions: Lost packets add latency.
- Dynamic Bandwidth Sharing: Bursty traffic competes for resources.
- Congestion Control: TCP adjusts rates based on perceived network conditions.
- Network Partitioning: Physical or logical separation of nodes can lead to communication breakdowns.
```mermaid
graph TD
    subgraph "Client Interaction"
    A[Client Request] --> B[Node 1]
    Q[Node 2] --> R[Client Response]
    end
    
    subgraph "Network Issues"
    C[Network Transport]
    C --> D["Message Loss<br>• Router drops packets<br>• NIC failures<br>• Process crashes"]
    C --> E["Network Delays<br>• Queue buildup<br>• Buffer bloat<br>• Congestion"]
    C --> F["Duplicate Messages<br>• TCP retransmission<br>• Producer retries<br>• Routing loops"]
    C --> G["Out-of-Order Delivery<br>• Multi-path routing<br>• Variable latency<br>• Packet prioritization"]
    end
    
    subgraph "System Impacts"
    D --> H["DATA INCONSISTENCY<br>• Divergent replicas<br>• Lost writes<br>• Stale reads<br>• Ledger forks"]
    E --> I["FAULT DETECTION ERRORS<br>• False leader elections<br>• Zombie processes<br>• Wasted resources<br>• Ledger sync failures"]
    F --> J["DUPLICATE EFFECTS<br>• Double charging<br>• Repeated jobs<br>• Incorrect counts<br>• Duplicate ledger entries"]
    G --> K["LOGICAL ERRORS<br>• Race conditions<br>• Deadlocks<br>• State corruption<br>• Ledger inconsistencies"]
    end
    
    subgraph "Mitigation Techniques"
    H --> L["CONSISTENCY MECHANISMS<br>• Quorum operations<br>• Read repair<br>• Merkle trees<br>• Blockchain consensus"]
    I --> M["LIVENESS PROTECTION<br>• Lease renewals<br>• Heartbeat patterns<br>• Phi-accrual detection<br>• Ledger checkpointing"]
    J --> N["IDEMPOTENCY CONTROLS<br>• Deduplication windows<br>• Exactly-once semantics<br>• Idempotency keys<br>• Transaction nonces"]
    K --> O["ORDERING GUARANTEES<br>• Version vectors<br>• Lamport clocks<br>• Sequence numbers<br>• Cryptographic hashing"]
    end
    
    subgraph "Ledger-Specific Protections"
    L --> P["LEDGER INTEGRITY<br>• Proof-of-work/stake<br>• Byzantine fault tolerance<br>• Immutable append-log<br>• Digital signatures"]
    M --> P
    N --> P
    O --> P
    end
    
    B --> C
    C --> Q
```

Diagram: Network issues can lead to message loss, duplication, and reordering, causing inconsistencies in distributed systems.

Solution: Use techniques like:
- **Quorum reads/writes**: Require a majority of nodes to agree on data.
- **Read repair**: Fix inconsistencies during reads.
- **Merkle trees**: Efficiently verify data integrity across nodes. 
- **Blockchain consensus**: Ensure all nodes agree on the same state.
- **Lease renewals**: Prevent stale leadership by requiring periodic updates.
- **Heartbeat patterns**: Regularly check node liveness.
- **Phi-accrual detection**: Dynamically adjust failure detection based on observed latencies.
- 
### 3. Timeouts

Problem: Choosing timeout values is a fundamental challenge in fault detection.
Why?

- Long timeouts delay failure recovery (users wait unnecessarily).
- Short timeouts cause false positives (nodes declared dead prematurely).

```mermaid
graph TD
    A[Timeout Set] --> B{Too Long?}
    A --> C{Too Short?}
    B --> D[Slow Failure Detection]
    C --> E[False Positives]
    D --> F[Cascading Failures]
    E --> G[Duplicate Actions]
```
### Solution: 
 - Use adaptive timeouts based on recent latency patterns, exponential backoff, and retries before declaring a node dead.

 - Algorithms like **Phi-accrual failure detection** can help balance these trade-offs by dynamically adjusting timeout thresholds based on observed latencies.
  
---
### What is a Network Partition?
A network partition (also called a "split-brain" scenario) occurs when a distributed system's nodes (servers/replicas) lose communication with each other due to a network failure. This creates isolated subgroups that cannot exchange data, leading to potential inconsistencies.

### How Network Partitions Happen
- Network cable failures
- Router/switch crashes
- Internet outages between data centers
- Firewall misconfigurations
- Cloud provider failures (e.g., AWS AZ outage)

````mermaid
sequenceDiagram
    participant Client1
    participant Client2
    participant US
    participant EU
    participant AS
    
    Note over US,EU: NETWORK PARTITION (US & EU cannot communicate)
    
    Client1->>US: Book seat 12A
    US->>AS: Sync update (works)
    US-->>Client1: "Booked!" (but EU never got the update)
    
    Client2->>EU: Is seat 12A available?
    EU-->>Client2: "Yes" (STALE DATA, because partition prevents sync)
    Client2->>EU: Book seat 12A
    EU-->>Client2: "Booked!" (CONFLICT: 12A now double-booked)
````


### How Systems Handle Partitions (Solution)

  - ### 1. CAP Theorem Trade-offs
      When a network partition occurs, systems must make trade-offs between consistency, availability, and partition tolerance. There are two common approaches:

      ### CP (Consistency + Partition Tolerance)
      * Reject writes during partitions to ensure consistency
      * Example: ZooKeeper

      ### AP (Availability + Partition Tolerance)

      * Allow writes but risk inconsistency
      * Example: Cassandra

  - ### 2. Recovery After Partition Heals
    When a partition heals, systems must recover from any conflicts that may have arisen. Two common techniques are:

    ### Conflict Resolution
    * "Last write wins" approach
    * Manual merge of conflicting data

    ### Rollback of Conflicting Transactions
    * Roll back transactions that conflicted during the partition

  ### Prevention Techniques
  To prevent partitions from causing issues, systems can use:

  - ### Quorum Systems
    * Require majority agreement among nodes before making decisions
    * Prevents split-brain scenarios
  - ### Leases/Heartbeats
    * Detect failures faster by requiring nodes to send periodic heartbeats
    * Allows for quicker recovery from partitions

  ## Key Takeaways
  ----------------

  * Network partitions break communication between nodes
  * Can cause data inconsistency (split-brain)
  * Handled via CAP trade-offs (CP vs. AP)
  * Strict serializability prevents conflicts but may sacrifice availability