
<!--
author: "Avinash Gurugubelli",
title: "Leader and Followers",
description: "Introduction to Replication"  
tags: ["Database Replication", "Distributed Systems", "High Availability", "Data Consistency"],
references: [{
    title: "Designing Data-Intensive Applications",
    authors: ["Martin Kleppmann"],
    publisher: "O'Reilly Media",
    year: 2017,
    url: "
}]
-->

# Understanding Replication in Data Systems

### Why Replication Matters

Imagine you're running a popular online store. Your database contains all your critical information - product inventory, customer orders, payment details. What happens if that single database server crashes? Your entire business comes to a halt. This is where database replication comes to the rescue.

Database replication means maintaining multiple copies of your data across different machines. It's like making backup photocopies of important documents and storing them in different locations. But replication does much more than just provide backups - it helps your application:

- **Reduce latency** by keeping data close to users.  
- **Increase availability** by allowing the system to function even if some nodes fail.  
- **Scale read throughput** by distributing queries across multiple replicas.  

However, managing changes across these replicas presents a key challenge. One of the most widely used solutions are
-  **single-leader replication** (also known as **master-slave replication**).
-  **multi-leader**,
-  **Leader less**

