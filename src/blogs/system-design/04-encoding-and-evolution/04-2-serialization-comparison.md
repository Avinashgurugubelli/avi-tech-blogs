<!--
author: "Avinash Gurugubelli",
title: "Serialization Format Comparison",
description: "A detailed comparison of various serialization formats including JSON, MessagePack, Thrift, and Protobuf.",
tags: ["Serialization", "JSON", "MessagePack", "Thrift", "Protobuf"],
references: [{
    title: "Designing Data-Intensive Applications",
    authors: ["Martin Kleppmann"],
    publisher: "O'Reilly Media",
    year: 2017,
    url: ""
}]
-->

# Serialization Format Comparison: JSON, MessagePack, Thrift & Protobuf

## Input JSON Object
```json
{
  "userName": "Martin",
  "favoriteNumber": 1337,
  "interests": ["daydreaming", "hacking"]
}
```

## Comparison Table

| Format                      | Size (Bytes) | Human Readable | Schema Required | Use Cases                        |
|-----------------------------|-------------|----------------|----------------|----------------------------------|
| JSON (UTF-8)                | 97          | ✅ Yes         | ❌ No          | Web APIs, logs                   |
| MessagePack                 | 67          | ❌ No          | ❌ No          | IoT, APIs, message queues         |
| Thrift (Binary Protocol)    | 58          | ❌ No          | ✅ Yes         | Microservices, RPC               |
| Thrift (Compact Protocol)   | 52          | ❌ No          | ✅ Yes         | Bandwidth-sensitive RPC          |
| Protocol Buffers (Protobuf) | 49          | ❌ No          | ✅ Yes         | gRPC, storage, messaging         |

---

## 1. Thrift (Binary Protocol) Example in JavaScript

### Thrift IDL (user_info.thrift)
```thrift
struct UserInfo {
  1: string userName,
  2: i32 favoriteNumber,
  3: list<string> interests
}
```

### JavaScript Example
```javascript
const thrift = require('thrift');
const UserInfo = require('./gen-nodejs/UserInfo');

const user = new UserInfo({
  userName: "Martin",
  favoriteNumber: 1337,
  interests: ["daydreaming", "hacking"]
});

const transport = new thrift.TBufferedTransport(null, function(buffer) {
  console.log("Thrift Binary Buffer Length:", buffer.length);
  console.log("Thrift Binary Hex Output:", buffer.toString('hex').match(/.{1,2}/g).join(' '));
});

const output = new thrift.TBinaryProtocol(transport);
user.write(output);
transport.flush();
```

### Expected Output
```
Thrift Binary Buffer Length: 58
Thrift Binary Hex Output: 0b 00 01 00 00 00 06 4d 61 72 74 69 6e 08 00 02 00 00 05 39 0f 00 03 0b 00 00 00 02 00 00 00 0b 64 61 79 64 72 65 61 6d 69 6e 67 00 00 00 07 68 61 63 6b 69 6e 67 00
```

---

## 2. Apache Thrift – Compact Protocol (JavaScript Example)

```javascript
const thrift = require('thrift');
const UserInfo = require('./gen-nodejs/UserInfo');

const user = new UserInfo({
  userName: "Martin",
  favoriteNumber: 1337,
  interests: ["daydreaming", "hacking"]
});

const transport = new thrift.TBufferedTransport(null, function(buffer) {
  console.log("Thrift Compact Buffer Length:", buffer.length);
  console.log("Thrift Compact Hex Output:", buffer.toString('hex').match(/.{1,2}/g).join(' '));
});

const output = new thrift.TCompactProtocol(transport);
user.write(output);
transport.flush();
```

### Expected Output
```
Thrift Compact Buffer Length: 52
Thrift Compact Hex Output: 16 0b 4d 61 72 74 69 6e 22 8a 02 0b 0b 64 61 79 64 72 65 61 6d 69 6e 67 07 68 61 63 6b 69 6e 67 00
```

---

## 3. Protocol Buffers (Protobuf) Example in JavaScript

### Proto Definition (user_info.proto)
```proto
syntax = "proto3";

message UserInfo {
  string userName = 1;
  int32 favoriteNumber = 2;
  repeated string interests = 3;
}
```

### JavaScript Example
```javascript
const protobuf = require('protobufjs');

protobuf.load("user_info.proto", function(err, root) {
  if (err) throw err;

  const UserInfo = root.lookupType("UserInfo");

  const payload = {
    userName: "Martin",
    favoriteNumber: 1337,
    interests: ["daydreaming", "hacking"]
  };

  const errMsg = UserInfo.verify(payload);
  if (errMsg) throw Error(errMsg);

  const message = UserInfo.create(payload);
  const buffer = UserInfo.encode(message).finish();

  console.log("Protobuf Buffer Length:", buffer.length);
  console.log("Protobuf Hex Output:", buffer.toString('hex').match(/.{1,2}/g).join(' '));
});
```

### Expected Output
```
Protobuf Buffer Length: 49
Protobuf Hex Output: 0a 06 4d 61 72 74 69 6e 10 89 0a 1a 0b 64 61 79 64 72 65 61 6d 69 6e 67 1a 07 68 61 63 6b 69 6e 67
```

---

## Protobuf Step-by-Step Breakdown

| Field             | Bytes                                                   | Explanation                                                      |
|------------------|---------------------------------------------------------|------------------------------------------------------------------|
| **userName**      | `0a 06 4d 61 72 74 69 6e`                                | Field 1 (string), Length 6, Value = "Martin"                      |
| **favoriteNumber**| `10 89 0a`                                              | Field 2 (int32), Varint (pronounce like "vair-int") = 1337                                    |
| **interests[0]**  | `1a 0b 64 61 79 64 72 65 61 6d 69 6e 67`                | Field 3 (string), Length 11, Value = "daydreaming"                |
| **interests[1]**  | `1a 07 68 61 63 6b 69 6e 67`                            | Field 3 (string), Length 7, Value = "hacking"                     |

## Field Key Calculation Example

For `userName`:
```
field_key = (field_number << 3) | wire_type
           = (1 << 3) | 2 = 0x0A
```

  ✅ What does 1 << 3 mean?
  - It’s a bitwise left shift operator in most programming languages (like JavaScript, Java, C, etc.)
  ```
  1 << 3
  ```
  🎯 Meaning:
  "Shift the binary representation of 1 to the left by 3 positions."
  | Decimal | Binary     |
| ------- | ---------- |
| 1       | `00000001` |
Shift left by 3 bits:
```
00000001 << 3  = 00001000

Which equals 8 in decimal.

SO

1 << 3 = 8

```

Here for userName

| Part                   | Value                                                         |                                                                 |
| ---------------------- | ------------------------------------------------------------- | --------------------------------------------------------------- |
| `1 << 3`               | **8**  (decimal) — shifts `00000001` left 3 bits → `00001000` |                                                                 |
| **Wire Type**          | **2**                                                         |                                                                 |
| \`8                    | 2\` (bitwise OR)                                              | **10** (decimal) — OR of `00001000` and `00000010` → `00001010` |
| **Hex Representation** | **0x0A** — because decimal 10 = hex `0A`                      |                                                                 |




For `favoriteNumber`:
```
field_key = (2 << 3) | 0 = 0x10 (varint)
```
For `interests`:
```
field_key = (3 << 3) | 2 = 0x1A (length-delimited)
```

## Summary

| Field              | Field Number | Wire Type | Bytes                                | Value        |
|-------------------|-------------|----------|-------------------------------------|-------------|
| userName          | 1           | 2 (string) | `0a 06 4d 61 72 74 69 6e`            | `"Martin"` |
| favoriteNumber    | 2           | 0 (varint) | `10 89 0a`                           | `1337` |
| interests[0]      | 3           | 2 (string) | `1a 0b 64 61 79 64 72 65 61 6d 69 6e 67` | `"daydreaming"` |
| interests[1]      | 3           | 2 (string) | `1a 07 68 61 63 6b 69 6e 67`         | `"hacking"` |



## Why Protobuf is Smaller than Thrift?

- **Per field header:** Protobuf uses 1 varint, Thrift uses type + field ID (2-3 bytes).
- **No STOP marker** in Protobuf.
- **Packed repeated fields** reduce list overhead.
- **Varint encoding** of integers saves space.
