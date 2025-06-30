<!--
author: "Avinash Gurugubelli",
date: "2023-10-01",
title: "Polymorphism in Object-Oriented Programming",
description: "A comprehensive guide to understanding polymorphism in object-oriented programming with Java examples.",
tags: ["polymorphism", "OOP", "Java", "method overriding", "method overloading"]
-->


## 📖 What is Polymorphism?

**Polymorphism** (Greek: *"many forms"*) allows a single interface or method to represent different underlying forms (data types or behaviors).

It enables:
- Code reuse and flexibility
- Clean separation between what code does and how it does it

---

## ♟️ Real-World Analogy – Chess Game

In a chess game, all pieces respond to the `move()` command but behave differently:

- `Bishop` moves diagonally
- `Knight` moves in an L-shape
- `Rook` moves in straight lines

> Same method `move()`, but different behaviors.

### 💡 Java Example – Chess

```java
public interface ChessPiece {
    void move();
}

public class Bishop implements ChessPiece {
    public void move() {
        System.out.println("Moves diagonally");
    }
}

public class Knight implements ChessPiece {
    public void move() {
        System.out.println("Moves in L-shape");
    }
}

public class Rook implements ChessPiece {
    public void move() {
        System.out.println("Moves in straight lines");
    }
}

public class ChessBoard {
    public static void main(String[] args) {
        ChessPiece bishop = new Bishop();
        ChessPiece knight = new Knight();
        ChessPiece rook = new Rook();

        bishop.move();  // Output: Moves diagonally
        knight.move();  // Output: Moves in L-shape
        rook.move();    // Output: Moves in straight lines
    }
}
```

---

## 🧪 Types of Polymorphism

### ⏱️ 1. Runtime Polymorphism (Dynamic Binding)

- Achieved through **method overriding**
- Behavior is determined **at runtime**
- Requires **inheritance** or **interfaces**

#### ✅ Java Example

```java
public class Animal {
    public void speak() {
        System.out.println("Animal makes a sound");
    }
}

public class Dog extends Animal {
    public void speak() {
        System.out.println("Dog barks");
    }
}

public class Cat extends Animal {
    public void speak() {
        System.out.println("Cat meows");
    }
}

public class Main {
    public static void main(String[] args) {
        Animal a1 = new Dog();
        Animal a2 = new Cat();

        a1.speak();  // Output: Dog barks
        a2.speak();  // Output: Cat meows
    }
}
```

---

### 🧮 2. Compile-time Polymorphism (Static Binding)

- Achieved through **method overloading**
- Method is selected at **compile time**
- Same method name with **different parameter lists**

#### ✅ Java Example

```java
public class Calculator {
    public int add(int a, int b) {
        return a + b;
    }

    public double add(double a, double b) {
        return a + b;
    }

    public int add(int a, int b, int c) {
        return a + b + c;
    }
}

public class Main {
    public static void main(String[] args) {
        Calculator calc = new Calculator();

        System.out.println(calc.add(2, 3));         // 5
        System.out.println(calc.add(2.5, 4.1));     // 6.6
        System.out.println(calc.add(1, 2, 3));      // 6
    }
}
```

---

## ✨ When to Use Polymorphism

✅ Use polymorphism when:
- You want to program to **interfaces, not implementations**
- You need **extensible**, **pluggable** behavior
- You want to follow **SOLID principles** (e.g. Open/Closed Principle)

---

## 🚫 When *Not* to Use Polymorphism

❌ 1. There’s no “is-a” relationship between types

-   Polymorphism (especially inheritance-based) should be used only when one class is a true subtype of another.
Bad example: Bird extends Car just to reuse a startEngine() method.

❌ 2. Overriding/overloading adds complexity with little benefit
- If method overloading/overriding introduces confusion or makes the design harder to understand without improving flexibility, avoid it.
This often happens when developers overuse polymorphism to "look smart," leading to fragile, bloated designs.

❌ 3. You're trying to reuse a few methods (prefer composition)
- If you're extending a class just to access a couple of utility methods, it's better to use composition (i.e., include the helper class as a field).
Inheritance forces you to take all the parent’s behavior — even the irrelevant parts — which can break encapsulation and lead to tight coupling.

---

## 📌 Summary Table

| Type                     | Binding Time | Technique           | Inheritance Needed | Example                      |
|--------------------------|--------------|----------------------|--------------------|------------------------------|
| Runtime Polymorphism     | Runtime      | Method Overriding    | ✅ Yes             | `Dog extends Animal`         |
| Compile-time Polymorphism| Compile Time | Method Overloading   | ❌ No              | `add(int, int)` / `add(double, double)` |

---

## 💬 Final Thoughts

Polymorphism helps you write:
- More **reusable**
- More **maintainable**
- More **extensible** code

---
