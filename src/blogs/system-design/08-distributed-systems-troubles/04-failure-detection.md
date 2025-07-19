<!--
This file is part of the Avi Tech Blogs repository.
Author: Avinash Gurugubelli
Title: Failure Detection in Distributed Systems: Techniques and Challenges",
Description: "A comprehensive guide to understanding failure detection in distributed systems, including methods, challenges, and practical solutions.",
Tags: [
  "Distributed Systems",
  "Failure Detection",
  "Network Issues",
  "Fault Tolerance",
  "System Design"
],
References: [{
  title: "Designing Data-Intensive Applications",
  authors: ["Martin Kleppmann"],
  publisher: "O'Reilly Media",
  year: 2017,
  url: "https://dataintensive.net/"
}]
-->

# Methods to Detect Failures in Distributed Systems

## 1. TCP/IP-Level Signals (Best Effort)

- **RST/FIN packets**  
  → OS rejects the connection if the process is dead.

  **Limitation:** Doesn’t tell you if the node **crashed mid-request**.

- **ICMP "Destination Unreachable"**  
  → Router indicates the node is offline.

  **Limitation:** Routers can be unreliable or blocked.

**✅ Possible Solutions:**
- Combine TCP signals with application-level heartbeats.
- Use multiple redundant paths or probes to validate node status.
- Avoid sole reliance on ICMP/TCP—treat as hints, not hard evidence.

---

## 2. External Notifications (If Available)

- **Admin scripts**  
  → Can notify peers if a process crashes while machine is alive (e.g., HBase region servers).

- **Hardware monitoring**  
  → Query switches or power controllers to detect powered-off machines.

  **Limitation:** Works only in **controlled data center environments**, not over public networks.

**✅ Possible Solutions:**
- Use external monitoring + internal heartbeat cross-checking.
- Employ **data center orchestration tools** (e.g., Kubernetes liveness probes) for detection and recovery.
- Build fallback mechanisms in case monitoring systems are compromised.

---

## 3. Application-Level Timeouts (Most Common)

- Assumption: If no response after **X seconds**, the node is likely dead.

**Trade-offs:**

| Timeout | Pros                     | Cons                        |
|---------|--------------------------|-----------------------------|
| Short   | Fast failure detection    | More **false positives**    |
| Long    | Fewer false positives     | Slower detection/recovery   |

**✅ Possible Solutions:**
- Use **adaptive timeouts** based on recent latency patterns.
- Apply **exponential backoff and retries** before declaring death.
- Consider quorum-based failure detection (e.g., only mark dead if N peers agree).


## 🧠 Summary

Failure detection is **best-effort and probabilistic**, not perfect. The goal is to:
- Minimize false alarms (false positives),
- Detect actual failures quickly (false negatives),
- And recover gracefully regardless of detection delays.

> 🔧 Combine techniques for **robustness**, not just speed.

