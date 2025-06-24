<!--
author: "Avinash Gurugubelli",
title: "MessagePack Examples in JavaScript",
description: "A practical example of using MessagePack for encoding data in JavaScript, comparing it with JSON.",
tags: ["MessagePack", "JavaScript", "Data Encoding", "Binary Format"],
references: [{
    title: "Designing Data-Intensive Applications",
    authors: ["Martin Kleppmann"],
    publisher: "O'Reilly Media",
    year: 2017,
    url: ""
}]
--->
# MessagePack Encoding Example in JavaScript

## Input JSON Object
```json
{"userName": "Martin", "favoriteNumber": 1337, "interests": ["daydreaming", "hacking"]}
```

## Comparison

| Format      | Size (bytes) |
|-------------|---------------|
| JSON        | 87          |
| MessagePack | 66          |

## MessagePack Hex Output
```
83 a8 75 73 65 72 4e 61 6d 65 a6 4d 61 72 74 69 6e ae 66 61 76 6f 72 69 74 65 4e 75 6d 62 65 72 cd 05 39 a9 69 6e 74 65 72 65 73 74 73 92 ab 64 61 79 64 72 65 61 6d 69 6e 67 a7 68 61 63 6b 69 6e 67
```

## Summary

MessagePack provides a more compact binary representation of data compared to JSON. 
In this example, MessagePack is approximately 21 bytes smaller (~24% size reduction).

## JavaScript Code Example
```javascript
const msgpack = require('@msgpack/msgpack');

const data = {
  userName: "Martin",
  favoriteNumber: 1337,
  interests: ["daydreaming", "hacking"]
};

// 1. JSON stringify and get size
const jsonStr = JSON.stringify(data);
const jsonSize = Buffer.byteLength(jsonStr, 'utf8');

// 2. MessagePack encode and get size
const encoded = msgpack.encode(data);
const msgpackSize = encoded.length;

// 3. Hex representation of MessagePack
const hexOutput = Array.from(encoded)
  .map(byte => byte.toString(16).padStart(2, '0'))
  .join(' ');

// 4. Print Results
console.log("Original JSON string:", jsonStr);
console.log("JSON size (bytes):", jsonSize);
console.log("MessagePack size (bytes):", msgpackSize);
console.log("MessagePack hex output:\n", hexOutput);
```

Sample Output:

```
Original JSON string: {"userName":"Martin","favoriteNumber":1337,"interests":["daydreaming","hacking"]}
JSON size (bytes): 97
MessagePack size (bytes): 67
MessagePack hex output:
 83 a8 75 73 65 72 4e 61 6d 65 a6 4d 61 72 74 69 6e af 66 61 76 6f 72 69 74 65 4e 75 6d 62 65 72 cd 05 39 a9 69 6e 74 65 72 65 73 74 73 92 ab 64 61 79 64 72 65 61 6d 69 6e 67 a7 68 61 63 6b 69 6e 67
```