<!--
author: "Avinash Gurugubelli",
title: "Liskov Substitution Principle",
description: "A practical take on the Liskov Substitution Principle using a Bird/Ostrich example to demonstrate behavioral contracts in inheritance.",
tags: ["SOLID", "LSP", "Java", "Inheritance", "Object-Oriented Programming"],
references: []
-->

## 5. Liskov Substitution Principle (LSP)

The Liskov Substitution Principle (LSP) states that objects of a superclass should be replaceable with objects of its subclasses without breaking the application. In other words, what we want is to have the objects of our subclasses behaving the same way as the objects of our superclass.

LSP is all about well-designed inheritance, when you inherit from a base class, you should be able to substitute your derived class with the base class without things going wrong. Otherwise, you have used inheritance incorrectly! And when you use inheritance incorrectly.
it leads to code that is confusing to understand.
it leads to a violation of the open-closed principle.

> “Objects of a superclass should be replaceable with objects of its subclasses without altering the correctness of the program.”  
> — **Barbara Liskov**

### 🤔 Let's Start With a Real-World Analogy

You’re building a bird sanctuary simulation. You decide to create a `Bird` class, and since all birds **can fly** (right?), you add a `fly()` method.

```java
public class Bird {
    public void fly() {
        System.out.println("Bird is flying...");
    }
}
```

You create some subclasses:

```java
public class Sparrow extends Bird {
    @Override
    public void fly() {
        System.out.println("Sparrow is flying.");
    }
}

public class Ostrich extends Bird {
    @Override
    public void fly() {
        throw new UnsupportedOperationException("Ostriches can't fly!");
    }
}
```

Then you write a function that uses a bird:

```java
public class BirdSanctuary {
    public void letBirdFly(Bird bird) {
        bird.fly();  // Works for Sparrow, but crashes for Ostrich!
    }
}
```

### 🧨 Problem

This **breaks LSP** because the `Ostrich` class *cannot* do what the base class `Bird` promises — fly. If your code expects a `Bird` and gets an `Ostrich`, it fails.

This means `Ostrich` is **not truly substitutable** for its superclass. It **violates the contract** of `Bird`.

---

## ✅ Fixing the Violation

We need to **rethink our inheritance** structure. Not all birds can fly, so let’s not assume they all should.

### Step 1: Split the hierarchy

```java
public abstract class Bird {
    public abstract void eat();
}
```

### Step 2: Create a `FlyingBird` subclass for birds that fly

```java
public abstract class FlyingBird extends Bird {
    public abstract void fly();
}
```

### Step 3: Rewrite your concrete classes

```java
public class Sparrow extends FlyingBird {
    public void eat() {
        System.out.println("Sparrow eats seeds");
    }

    public void fly() {
        System.out.println("Sparrow is flying");
    }
}

public class Ostrich extends Bird {
    public void eat() {
        System.out.println("Ostrich eats plants");
    }

    // No fly() method — because Ostriches can't fly
}
```

### Step 4: Update client code

```java
public class BirdSanctuary {
    public void letBirdEat(Bird bird) {
        bird.eat();
    }

    public void letBirdFly(FlyingBird bird) {
        bird.fly();  // Safe: Only flying birds can be passed
    }
}
```

---

## ✅ Why This Is Better

| ❌ Old Design                         | ✅ New Design                         |
|-------------------------------------|--------------------------------------|
| `Bird` assumes all birds can fly    | `Bird` only defines shared behavior  |
| `Ostrich.fly()` throws an exception | `Ostrich` has no `fly()` method      |
| Violates LSP                        | Respects LSP                         |
| Fragile code                        | Robust, testable code                |

---

## 🧠 Key Takeaway

If your subclass can’t be used in place of the parent class without unexpected results, you’ve broken LSP.

> Build your inheritance tree based on **behavior**, not just what "makes sense" in the real world.  
> A square *is* a rectangle in math—but not necessarily in code.