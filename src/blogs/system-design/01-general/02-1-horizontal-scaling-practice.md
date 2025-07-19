<!--
author: "Avinash Gurugubelli",
title: "Horizontal Scaling Practice Guide",
description: "A practical guide to horizontal scaling with hands-on examples using Node.js, MongoDB, Kafka, and Redis."
tags: ["Horizontal Scaling", "Node.js", "MongoDB", "Kafka", "Redis", "Docker Compose"],
references: [{
    title: "Designing Data-Intensive Applications",
    authors: ["Martin Kleppmann"],
    publisher: "O'Reilly Media",
    year: 2017,
    url: "https://dataintensive.net/"
}]
-->
## Horizontal Scaling Practice Guide

---

### 1. **Practice: Node.js Web App Horizontal Scaling with NGINX Load Balancer**

#### **Steps:**

1. **Create Node.js App**:

```js
const http = require('http');
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end(`Response from server on port ${port}`);
}).listen(port);
```

2. **Run multiple instances:**

```
PORT=3000 node app.js
PORT=3001 node app.js
PORT=3002 node app.js
```

3. **Setup NGINX Load Balancer:**

```
upstream nodeapp {
  server 127.0.0.1:3000;
  server 127.0.0.1:3001;
  server 127.0.0.1:3002;
}
server {
  listen 8080;
  location / {
    proxy_pass http://nodeapp;
  }
}
```

4. **Test:**

```
curl http://localhost:8080
```

---

### 2. **Practice: MongoDB Sharded Cluster using Docker Compose**

#### **Docker Compose file:**

```yaml
version: '3'
services:
  configsvr:
    image: mongo
    command: mongod --configsvr --replSet rs0 --port 27019
    ports:
      - 27019:27019

  shard1:
    image: mongo
    command: mongod --shardsvr --replSet shard1 --port 27018
    ports:
      - 27018:27018

  mongos:
    image: mongo
    command: mongos --configdb rs0/configsvr:27019 --bind_ip_all
    ports:
      - 27017:27017
```

#### **Steps:**

- Initialize replica sets inside each container.
- Add shards to mongos.
- Insert data and query.

---

### 3. **Practice: Kafka Multi-Broker Cluster using Docker Compose**

#### **Docker Compose file:**

```yaml
version: '3'
services:
  zookeeper:
    image: wurstmeister/zookeeper
    ports:
      - "2181:2181"

  kafka1:
    image: wurstmeister/kafka
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka1:9092

  kafka2:
    image: wurstmeister/kafka
    ports:
      - "9093:9093"
    environment:
      KAFKA_BROKER_ID: 2
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka2:9093
```

#### **Steps:**

- Create topic with multiple partitions.
- Produce and consume messages.

---

### 4. **Practice: Redis Cluster using Docker Compose**

#### **Docker Compose file:**

```yaml
version: '3'
services:
  redis1:
    image: redis
    ports:
      - "7000:6379"

  redis2:
    image: redis
    ports:
      - "7001:6379"

  redis3:
    image: redis
    ports:
      - "7002:6379"
```

#### **Steps:**

- Start Redis containers.
- Use `redis-cli --cluster create` to form cluster.
- Write/read data to see key distribution.

---

## ✅ **Bonus: Cloud Practice (AWS Free Tier)**

- Launch **2 EC2 instances**.
- Install and run Node.js app.
- Setup **Elastic Load Balancer (ELB)**.
- Verify request routing via ELB DNS.

---

