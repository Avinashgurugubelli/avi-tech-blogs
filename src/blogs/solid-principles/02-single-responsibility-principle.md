<!--
author: "Avinash Gurugubelli",
title: "Single Responsibility Principle",
description: "Understanding the Single Responsibility Principle and how it helps in building focused, modular, and testable classes in object-oriented programming.",
tags: ["SOLID", "SRP", "Java", "Clean Code", "Software Design"],
references: []
-->

## 1. Single Responsibility Principle (SRP)

The **S** in SOLID stands for Single Responsibility principal, This principle states that a class should only have one responsibility. Furthermore, it should only have one reason to change.

> A class should have only one reason to change.

### ❌ Violating SRP

```java
public class BatteryMonitor {
    static boolean batteryIsOk(float temperature, float soc, float chargeRate) {
        if(chargeRate > 0.8) {
            System.out.println("Charge Rate is out of range!");
            return false;
        }
        if(soc < 20 || soc > 80) {
            System.out.println("State of Charge is out of range!");
            return false;
        }
        if(temperature < 0 || temperature > 45) {
            System.out.println("Temperature is out of range!");
            return false;
        }
        return true;
    }
}
```

### 🚩 Problems:
- Violates SRP by mixing validation and logging.
- Hard to extend (e.g., for file logging).
- Difficult to test due to tight coupling with console output.

---

### ✅ Refactored for SRP

```java
public class ConsoleLogger {
    public void log(String message) {
        System.out.println(message);
    }
}

public class BatteryMonitor {

    private ConsoleLogger logger;

    public BatteryMonitor() {
        this.logger = new ConsoleLogger();
    }

    public boolean batteryIsOk(float temperature, float soc, float chargeRate) {
        return checkTemp(temperature) && checkSoc(soc) && checkChargeRate(chargeRate);
    }

    private boolean checkTemp(float temperature) {
        if(temperature < 0 || temperature > 45) {
            logger.log("Temperature is out of range!");
            return false;
        }
        return true;
    }

    private boolean checkSoc(float soc) {
        if(soc < 20 || soc > 80) {
            logger.log("State of Charge is out of range!");
            return false;
        }
        return true;
    }

    private boolean checkChargeRate(float chargeRate) {
        if(chargeRate > 0.8) {
            logger.log("Charge Rate is out of range!");
            return false;
        }
        return true;
    }
}
```

### ✅ Benefits:
- Better modularity.
- Easier to test and extend.
- Logging and validation are now separate concerns.

---