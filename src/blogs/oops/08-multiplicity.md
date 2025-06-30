<!--
author: "Avinash Gurugubelli",
title: "**Multiplicity** defines how many **instances** of one class can be associated with **a single instance** of another class in a relationship. It sets constraints on **how many objects can participate** in the relationship.",

tags: ["OOPS", "Class Diagrams", "Multiplicity"]
references: []
date: "2023-10-01"
-->


### 🧠 What is Multiplicity?

**Multiplicity** defines how many **instances** of one class can be associated with **a single instance** of another class in a relationship. It sets constraints on **how many objects can participate** in the relationship.

Think of it as **cardinality** in databases or "how many" in plain English.

---

### 📊 Examples of Multiplicity

| Multiplicity | Meaning                                        |
|--------------|------------------------------------------------|
| `1`          | Exactly one                                    |
| `0..1`       | Zero or one (optional)                         |
| `0..*` or `*`| Zero or more (many)                            |
| `1..*`       | One or more (at least one required)            |
| `n..m`       | Between n and m (inclusive range)              |

---

### ✅ Real-World Examples

| Relationship                        | Interpretation                        |
|-------------------------------------|----------------------------------------|
| A `Library` has `0..*` `Books`      | A library can have **many or no** books |
| A `Person` has `0..1` `Passport`    | A person may have **only one or no** passport |
| A `Team` has `1..11` `Players`      | A team must have **at least one**, max 11 players |
| A `University` has `1..*` `Departments` | A university must have **one or more** departments |

---

### 🖼️ UML Notation (Visual)

In class diagrams, multiplicity is shown **at the ends of association lines**:

```text
+--------------+        1..*        +------------+
|   Customer   |-------------------|   Orders   |
+--------------+                   +------------+
```

### 💡 Why It Matters
- Ensures data integrity (e.g., a person must have one name).
- Helps identify optional vs required relationships.
- Used for validating design logic during system modeling.
- Makes code clearer and easier to map to database schema.

### ✅ TL;DR Summary

| Notation      | Meaning                | Example                             |
| ------------- | ---------------------- | ----------------------------------- |
| `1`           | Exactly one            | A student has 1 roll number         |
| `0..1`        | Zero or one (optional) | A person may have a middle name     |
| `0..*` or `*` | Zero or more           | A course may have many students     |
| `1..*`        | One or more            | An order must have at least 1 item  |
| `n..m`        | Range between n and m  | A lottery ticket can have 1–5 picks |

🧠 Use multiplicity to define the boundaries of relationships, and make your UML diagrams precise and professional.