<!--
author: "Avinash Gurugubelli",
title: "Open Closed Principle",
description: "Learn how the Open/Closed Principle enables extending software behavior without modifying existing code, demonstrated with Java.",
tags: ["SOLID", "OCP", "Open Closed Principle", "Java", "Object-Oriented Design"],
references: []
-->

## 4. Open/Closed Principle (OCP)

In object-oriented programming, the **open–closed principle (OCP)** states "software entities (classes, modules, functions, etc.) should be open for extension, but closed for modification"; that is, such an entity can allow its behaviour to be extended without modifying its source code.

> Software entities should be open for extension, but closed for modification.

### ❌ Violating OCP

```java
public class Game {
    private Weapon weapon;

    public Game(Weapon weapon) {
        this.weapon = weapon;
    }

    public void action() {
        if (weapon.type.equals("GUN")) {
            System.out.println("Perform GUN attack");
        } else if (weapon.type.equals("BOMB")) {
            System.out.println("Perform BOMB attack");
        }
    }
}
```

### ✅ Fix: Use Polymorphism

```java
public interface IWeapon {
    void performAction();
}

public class Gun implements IWeapon {
    public void performAction() {
        System.out.println("Perform GUN attack");
    }
}

public class Bomb implements IWeapon {
    public void performAction() {
        System.out.println("Perform BOMB attack");
    }
}

public class Game {
    private IWeapon weapon;

    public Game(IWeapon weapon) {
        this.weapon = weapon;
    }

    public void action() {
        weapon.performAction();
    }
}
```