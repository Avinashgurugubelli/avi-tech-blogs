<!--
author: "Avinash Gurugubelli",
title: "Encapsulation and Abstraction in OOP",
description: "A deep dive into the concepts of encapsulation and abstraction in Object-Oriented Programming.",
tags: ["OOP", "Encapsulation", "Abstraction", "Software Development"],
references: []
-->

### 1. 🔐 Encapsulation
Encapsulation is the mechanism of **hiding internal state** and requiring all interaction to be performed through an object's **methods**. This promotes security, modularity, and maintainability.

In object-oriented programming, **access modifiers** like `private`, `protected`, and `public` are used to enforce encapsulation.  
For example, in Java, class fields are often marked as `private`, and accessed via `public` getter/setter methods.

### Why it matters:

Prevents unauthorized access

Simplifies debugging and maintenance

Enables controlled access to object data

**Example in Java:**
```java
public class Employee {
    private String id;
    private String name;

    public String getId() {
        return this.id;
    }

    public String getName() {
        return name;
    }

    public void setName(String newName) {
        this.name = newName;
    }
}

public class Main {
    public static void main(String[] args) {
        Employee emp = new Employee();
        // emp.name = "John"; // ❌ Not allowed
        emp.setName("John");   // ✅ Proper way
        System.out.println(emp.getName());
    }
}
```

### 🔒 Java Access Modifiers

| Modifier   | Class | Package | Subclass (Same Package) | Subclass (Other Package) | World (Other Classes) |
|------------|:-----:|:-------:|:------------------------:|:------------------------:|:----------------------:|
| `public`   | ✅    | ✅      | ✅                       | ✅                       | ✅                     |
| `protected`| ✅    | ✅      | ✅                       | ✅                       | ❌                     |
| *(default)* (no keyword) | ✅ | ✅ | ✅                | ❌                       | ❌                     |
| `private`  | ✅    | ❌      | ❌                       | ❌                       | ❌                     |

> ✅ = Accessible, ❌ = Not Accessible

**Note:**
- The default access (also called *package-private*) means no modifier is specified.
- `protected` allows access to subclasses even in different packages.


---

## 2. 🧼 Abstraction
Abstraction means **hiding complexity** by showing only relevant details. In Java, it's achieved through `abstract` classes and `interfaces`.

### 🚗 Real-World Analogy: Car as Abstraction

A **car** is a perfect example of abstraction in the real world.

> When you drive a car, you simply **turn the key** or **press the start button** to get it going.

You don’t need to understand:
- How the ignition system works internally
- What sequence of sensors or pistons are triggered
- How fuel is injected into the engine

All of that **complex internal logic is hidden** from you.

As a driver, you're only exposed to a **simple interface**:
- `Start()`
- `Accelerate()`
- `Brake()`

This is **abstraction** — exposing only what is necessary and hiding the rest. Just like in software, the **interface remains clean and consistent**, even if the underlying implementation evolves.

Abstraction means **hiding complexity** by showing only relevant details. In Java, it's achieved through `abstract` classes and `interfaces`.

**Real-world example:**  
You can drive a car without knowing how the engine works.

**Code Example:**
```java
// Interface defining abstract behavior
public interface Car {
    void turnOnCar();
    void turnOffCar();
    String getCarType();
}

// Concrete implementation: ManualCar
public class ManualCar implements Car {
    private String carType = "Manual";

    @Override
    public void turnOnCar() {
        System.out.println("Manual car started");
    }

    @Override
    public void turnOffCar() {
        System.out.println("Manual car stopped");
    }

    @Override
    public String getCarType() {
        return this.carType;
    }
}

// Concrete implementation: AutomaticCar
public class AutomaticCar implements Car {
    private String carType = "Automatic";

    @Override
    public void turnOnCar() {
        System.out.println("Automatic car started");
    }

    @Override
    public void turnOffCar() {
        System.out.println("Automatic car stopped");
    }

    @Override
    public String getCarType() {
        return this.carType;
    }
}

// Main class to demonstrate abstraction
public class CarTest {
    public static void main(String[] args) {
        Car manual = new ManualCar();
        Car automatic = new AutomaticCar();

        manual.turnOnCar();
        manual.turnOffCar();
        System.out.println("Type: " + manual.getCarType());

        automatic.turnOnCar();
        automatic.turnOffCar();
        System.out.println("Type: " + automatic.getCarType());
    }
}

```

---

## 🤔 Abstraction vs. Encapsulation — Why Two Concepts?

It's a common question:

> **"Both abstraction and encapsulation hide things, so why do we have two different concepts?"**

Let’s clarify the difference:

| Concept           | What it Hides                      | Focus Area                  | Example                                                                 |
|------------------|------------------------------------|-----------------------------|-------------------------------------------------------------------------|
| **Abstraction**   | Hides *implementation complexity* | **Design decision**         | Using a `List` interface without caring if it's an `ArrayList` or `LinkedList` |
| **Encapsulation** | Hides *internal state/data*       | **Implementation decision** | Making class fields `private` and exposing only `getters/setters`      |

---

### 🔍 Simplified Explanation

- **Abstraction** is about **what** the object does.  
  👉 Focuses on designing clean **interfaces** that hide the complex inner workings.

- **Encapsulation** is about **how** the object does it.  
  👉 Focuses on **protecting internal data** by restricting direct access.

---

### ✅ Key Takeaway

> **Abstraction is a design-time decision** — what behaviors and contracts you expose.  
> **Encapsulation is an implementation-time decision** — how you secure and structure internal state.

---

### 🧠 Other Real-World Analogy

- **Abstraction**: You use a **TV remote** — you press “Power” to turn it on. You don’t need to know what happens inside.
- **Encapsulation**: The **battery compartment** is enclosed — you can’t just touch the wires or mess with internals.
