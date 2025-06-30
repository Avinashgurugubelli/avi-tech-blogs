<!--
author: "Avinash Gurugubelli",
title: "Abstract Class vs Interface in OOPS (With Java Examples)",
description: "A comprehensive guide to understanding abstract classes and interfaces in Object-Oriented Programming with Java examples.",
tags: ["OOP", "Abstract Class", "Interface", "Java"],
references: []
date: "2023-10-01"
-->

## ❓ What is an Abstract Class?

An **abstract class** is a partially implemented blueprint. It:
- **Cannot be instantiated** on its own.
- Can contain both:
  - **Implemented methods** (with logic)
  - **Abstract methods** (just signatures, no logic)
- Allows you to define common **base behavior** for related classes.

🧠 Think of it like a **partially built house**. You can define the layout and structure, but each floor (subclass) will finish the interior their own way.

---

## ❓ What is an Interface?

An **interface** is a contract that specifies **what** a class must do, but **not how** to do it.  
- It only defines **method signatures** — no implementation.
- A class that implements an interface must define **all** its methods.
- Interfaces are ideal for **capabilities** or **roles**.

🧠 Think of an interface like a **remote control manual**. It defines which buttons must exist (e.g., `power()`, `volumeUp()`), but says nothing about what kind of TV or speaker is behind it.

---

## 🌍 Real-World Examples

### 🧱 Abstract Class – Java Example

```java
abstract class Vehicle {
    String fuelType = "Diesel";

    public void startEngine() {
        System.out.println("Starting engine...");
    }

    // Abstract method
    public abstract void drive();
}

class Car extends Vehicle {
    public void drive() {
        System.out.println("Driving a car...");
    }
}

class Truck extends Vehicle {
    public void drive() {
        System.out.println("Driving a truck...");
    }
}

public class TestAbstract {
    public static void main(String[] args) {
        Vehicle car = new Car();
        car.startEngine();
        car.drive();
    }
}
```

### 🎮 Interface – Java Example

``` java
interface Playable {
    void play();
    void pause();
}

class MusicPlayer implements Playable {
    public void play() {
        System.out.println("Playing music...");
    }

    public void pause() {
        System.out.println("Music paused.");
    }
}

class VideoPlayer implements Playable {
    public void play() {
        System.out.println("Playing video...");
    }

    public void pause() {
        System.out.println("Video paused.");
    }
}

public class TestInterface {
    public static void main(String[] args) {
        Playable player = new MusicPlayer();
        player.play();
        player.pause();
    }
}
```

### 🤔 When to Use What?

Use abstract class when:

- You have a base class with some shared code

- Classes are closely related (e.g., all are Vehicles)

Use interface when:

- You want to define a role or behavior (e.g., Flyable, Storable)

- You need to apply behavior to unrelated classes

- You want to take advantage of multiple inheritance

### 🔍 Key Differences

| Feature                | Abstract Class                                 | Interface                                |
| ---------------------- | ---------------------------------------------- | ---------------------------------------- |
| Purpose                | Define **common behavior** for related classes | Define **capabilities** for any class    |
| Can have method bodies | ✅ Yes (partial implementation)                 | ❌ No (only signatures)                   |
| Inheritance            | Single inheritance only (one abstract class)   | Can implement multiple interfaces        |
| Constructors/Fields    | ✅ Can have fields and constructors             | ❌ No constructors or fields              |
| Relationship type      | “**is-a**” relationship (inheritance)          | “**can-do**” or “acts like” (capability) |
| Reusability            | Encourages code reuse                          | Encourages flexibility and decoupling    |


### ⚖️ Summary



| Scenario                          | Use Abstract Class | Use Interface   |
| --------------------------------- | ------------------ | --------------- |
| Shared code or logic              | ✅ Yes              | ❌ No            |
| Closely related classes           | ✅ Yes              | ❌ No            |
| Add behavior to unrelated classes | ❌ No               | ✅ Yes           |
| Multiple inheritance required     | ❌ No               | ✅ Yes           |
| You want a flexible contract      | 🚫 Less flexible   | ✅ More flexible |


### 💬 Quick Analogy
| Concept   | Analogy                              |
| --------- | ------------------------------------ |
| Abstract  | Architectural blueprint + base frame |
| Interface | Contract everyone must follow        |
