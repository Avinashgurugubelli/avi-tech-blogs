<!--
author: "Avinash Gurugubelli",
title: "Introduction to Object-Oriented Programming (OOP)",
description: "An overview of the key concepts and principles of Object-Oriented Programming.",
tags: ["OOP", "Programming", "Software Development"],
references: []
-->

# 📘 Introduction to Object-Oriented Programming (OOPS)

**Object-Oriented Programming (OOPS)** is a programming paradigm that models real-world entities as objects. It helps organize software design by bundling data and behavior into reusable units, making code easier to understand, maintain, and extend.

---

## 🔹 What is a Class?

A **class** is a blueprint or template that defines the structure and behavior of objects. It specifies:

- **Attributes (properties):** Data that describes the object (e.g., color, size, name)
- **Methods (functions):** Actions or behaviors the object can perform (e.g., start, stop, calculate)

Think of a class as a blueprint for creating many objects with similar characteristics.

### 📦 Real-World Analogy

A `Car` class might have:
- Attributes: `color`, `model`, `speed`
- Methods: `accelerate()`, `brake()`

---

## 🔸 What is an Object?

An **object** is a specific instance of a class. It contains **actual values** for the attributes defined by the class and can perform the behaviors (methods).

Each object is **unique**, even if created from the same class.

### ✅ Example

- `myCar` is an object of the class `Car` with `color = Red`, `model = Tesla Model 3`, and `speed = 0`
- `yourCar` is another object of the same class with different values

---

## 🧪 Simple Example in Python

```python
class Car:
    def __init__(self, color, model):
        self.color = color
        self.model = model
        self.speed = 0

    def accelerate(self):
        self.speed += 10

    def brake(self):
        self.speed = max(0, self.speed - 10)

# Creating objects
myCar = Car("Red", "Tesla Model 3")
yourCar = Car("Blue", "BMW X5")

myCar.accelerate()
print(f"My car speed: {myCar.speed}")  # Output: 10
print(f"Your car model: {yourCar.model}")  # Output: BMW X5

```

## 🧪 Simple Example in Java

``` java
public class Car {
    private String color;
    private String model;
    private int speed;

    // Constructor
    public Car(String color, String model) {
        this.color = color;
        this.model = model;
        this.speed = 0;
    }

    // Method to increase speed
    public void accelerate() {
        this.speed += 10;
    }

    // Method to decrease speed
    public void brake() {
        this.speed = Math.max(0, this.speed - 10);
    }

    // Getter for speed
    public int getSpeed() {
        return this.speed;
    }

    // Getter for model
    public String getModel() {
        return this.model;
    }
}

// Main class to test the Car
public class Main {
    public static void main(String[] args) {
        Car myCar = new Car("Red", "Tesla Model 3");
        Car yourCar = new Car("Blue", "BMW X5");

        myCar.accelerate();

        System.out.println("My car speed: " + myCar.getSpeed());      // Output: My car speed: 10
        System.out.println("Your car model: " ß+ yourCar.getModel());  // Output: Your car model: BMW X5
    }
}

```

## 📌 Key Concepts Recap

| Term      | Description                             | Example                       |
| --------- | --------------------------------------- | ----------------------------- |
| Class     | Blueprint defining attributes & methods | `Car` class with color, model |
| Object    | Instance of a class with actual values  | `myCar` with color `"Red"`    |
| Attribute | Data stored in an object                | `color`, `speed`              |
| Method    | Function that defines object behavior   | `accelerate()`, `brake()`     |
