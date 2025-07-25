<!--
author: "Avinash Gurugubelli",
title: "Sample Query Comparison: SQL, CQL (Cypher), SPARQL",
description: "A comparative analysis of SQL, CQL (Cypher), and SPARQL queries for a common graph query problem.",
tags: ["Graph Databases", "SQL", "CQL", "SPARQL", "Cypher"],
references: [{
    title: "Designing Data-Intensive Applications",
    authors: ["Martin Kleppmann"],
    publisher: "O'Reilly Media",
    year: 2017,
    url: "https://dataintensive.net/"
}]
-->

## Sample Query Comparison: SQL, CQL (Cypher), SPARQL

### Problem: Find names of all persons who know 'Alice'

---

### 1. **Relational Database (SQL)**

#### Data Model (Tables):

```
Table: Person
+----+--------+
| id | name   |
+----+--------+
| 1  | Alice  |
| 2  | Bob    |
| 3  | Carol  |
+----+--------+

Table: Knows
+----------+----------+
| person_id| friend_id|
+----------+----------+
| 2        | 1       | -- Bob knows Alice
| 3        | 1       | -- Carol knows Alice
+----------+----------+
```

#### Query:

```sql
SELECT p.name
FROM Person p
JOIN Knows k ON p.id = k.person_id
JOIN Person f ON k.friend_id = f.id
WHERE f.name = 'Alice';
```

---

### 2. **Property Graph (CQL / Cypher - Neo4j)**

#### Data Model:

```
(:Person {name: 'Alice'})
(:Person {name: 'Bob'})
(:Person {name: 'Carol'})
(:Person {name: 'Bob'}) -[:KNOWS]-> (:Person {name: 'Alice'})
(:Person {name: 'Carol'}) -[:KNOWS]-> (:Person {name: 'Alice'})
```

#### Query:

```cypher
MATCH (p:Person)-[:KNOWS]->(a:Person {name: 'Alice'})
RETURN p.name;
```

---

### 3. **Triple Store (SPARQL - RDF)**

#### Data Model (Triples):

```
:Bob   :knows   :Alice .
:Carol :knows   :Alice .
:Alice :name    "Alice" .
:Bob   :name    "Bob" .
:Carol :name    "Carol" .
```

#### Query:

```sparql
PREFIX : <http://example.org/>

SELECT ?personName
WHERE {
  ?person :knows ?friend .
  ?friend :name "Alice" .
  ?person :name ?personName .
}
```

---

## Summary Table

| **Aspect**             | **SQL (Relational)**                 | **CQL (Property Graph)**                    | **SPARQL (Triple Store)**                   |
| ---------------------- | ------------------------------------ | ------------------------------------------- | ------------------------------------------- |
| **Data Model**         | Tables with foreign keys             | Nodes and Edges with properties             | Subject-Predicate-Object triples            |
| **Example Query**      | `JOIN` tables to match relationships | `MATCH` pattern of nodes and edges          | `WHERE` triple patterns + optional prefixes |
| **Schema Flexibility** | Fixed (schema defined)               | Flexible (properties on nodes/edges)        | Very flexible (RDF schema/OWL optional)     |
| **Use Case Fit**       | Transactional, structured data       | Graph traversal-heavy (social, fraud, etc.) | Semantic Web, linked data, reasoning        |

---
