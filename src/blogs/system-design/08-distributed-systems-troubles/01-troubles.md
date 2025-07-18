<!--
author: "Avinash Gurugubelli",
title: "The Troubles of Distributed Systems",
description: "This blog discusses the common challenges faced in distributed systems, including network issues, data consistency, and fault tolerance.",
tags: [
  "Distributed Systems",
  "Network Issues",
  "Data Consistency",
  "Fault Tolerance",
  "System Design"
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

### 2. Unreliable Networks
Key idea: Networks can be unreliable, leading to message loss, duplication, or reordering.
This can cause inconsistencies in data and complicate communication between distributed components.

```mermaid
graph TD
    A[Client] -->|Send Request| B[Node 1]
    B -->|Process Request| C[Network]
    C -->|Possible Issues| D[Node 2]
    
    subgraph Network Problems
    C --> E[Message Lost]
    C --> F[Message Delayed]
    C --> G[Message Duplicated]
    C --> H[Message Reordered]
    end
    
    D -->|Response| A
    
    subgraph Consequences
    I[Inconsistent Data]
    J[Duplicate Processing]
    K[Race Conditions]
    L[Timeout Errors]
    end
    
    E --> I
    F --> L
    G --> J
    H --> K
```