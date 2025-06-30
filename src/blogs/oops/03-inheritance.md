
<!---
title: "Inheritance in OOP: When to Use and When to Avoid"
description: "Learn about inheritance in Object-Oriented Programming, its benefits, pitfalls, and when to prefer composition over inheritance."
tags: ["OOP", "Inheritance", "Java", "Programming"]
date: "2023-10-01"
author: "Avinash Gurugubelli"
--->

## 👪 1. What is Inheritance?

**Inheritance** is one of the four pillars of Object-Oriented Programming. It allows one class (called a **subclass** or **child class**) to acquire the properties and behaviors of another class (called a **superclass** or **parent class**).

This helps in:
- Promoting **code reuse**
- Establishing a **logical hierarchy**
- Enabling **polymorphism**

### 🔧 Java Example

```java
// Superclass
public class Person {
    String name;
    public void speak() {
        System.out.println("Speaking...");
    }
}

// Subclass
public class Employee extends Person {
    int employeeId;
    public void work() {
        System.out.println("Working...");
    }
}

// Usage
Employee emp = new Employee();
emp.name = "John";      // inherited
emp.speak();            // inherited
emp.work();             // subclass method
```

---

## 🌍 2. Real-World Example

Imagine a hierarchy of people in an organization:

- **Person** → base class (common attributes like name, age)
- **Employee** → inherits from Person and adds employeeId, salary
- **Manager** → inherits from Employee and adds team handling logic

> A `Manager` **is-an** `Employee`, and an `Employee` **is-a** `Person`. This is a perfect example of inheritance.

---

## 🚫 3. Example: Misusing Inheritance for Partial Reuse

Sometimes developers inherit from a class **just to reuse a couple of methods**, even when the classes are not conceptually related. This leads to **tight coupling** and fragile design.

### 🧱 Problematic Example

```java
public class ReportUtils {
    public void generatePDF() { System.out.println("PDF generated"); }
    public void exportExcel() { System.out.println("Excel exported"); }
    public void sendEmail() { System.out.println("Email sent"); }
    public void archiveReport() { System.out.println("Report archived"); }
}

public class SalesReportService extends ReportUtils {
    public void generateSalesReport() {
        generatePDF();
        exportExcel();
    }

    @Override
    public void sendEmail() {
        System.out.println("❌ Not applicable for SalesReport");
    }

    @Override
    public void archiveReport() {
        System.out.println("❌ Not needed here");
    }
}
```

#### ⚠️ What’s Wrong?

- `SalesReportService` is **not a kind of** `ReportUtils` — they’re unrelated by nature
- You're **inheriting unnecessary behavior**
- Code is **tightly coupled** and fragile to changes in the base class

---

## ✅ 4. Preferred Solution: Use Composition

```java
public class SalesReportService {
    private ReportUtils reportUtils = new ReportUtils();

    public void generateSalesReport() {
        reportUtils.generatePDF();
        reportUtils.exportExcel();
    }
}
```

- Now `SalesReportService` is **loosely coupled**
- It **only uses** the methods it needs
- Avoids confusion and fragile design

---

## 💡 5. Rule of Thumb

> **Use Inheritance** only for **"is-a"** relationships  
> **Use Composition** for **"has-a"** or **"uses-a"** relationships

| ❌ Avoid Inheritance When...               | ✅ Use Composition Instead             |
|-------------------------------------------|----------------------------------------|
| Only a few methods are reused             | You need flexible, selective usage     |
| Classes are unrelated by nature           | Behavior is pluggable or optional      |
| You want to reduce coupling               | Composition leads to cleaner designs   |

---
