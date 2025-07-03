<!--
author: "Avinash Gurugubelli",
title: "Dependency Inversion Principle",
description: "Learn how the Dependency Inversion Principle helps decouple high-level and low-level modules using interfaces and abstractions.",
tags: ["SOLID", "DIP", "Dependency Injection", "Abstraction", "Java"],
references: []
-->


## 2. Dependency Inversion Principle (DIP)

- The **D** in SOLID stands for Dependency inversion principal, The principle of dependency inversion refers to the decoupling of software modules. This way, instead of high-level modules depending on low-level modules, both will depend on abstractions.**
> High-level modules should not depend on low-level modules. Both should depend on abstractions.

The previous solution still **creates ConsoleLogger inside** the `BatteryMonitor`, making it **tightly coupled**. To decouple, use interfaces:

```java
public interface ILogger {
    void log(String message);
}
```

### ✅ Applying DIP with Constructor Injection

```java
public class BatteryMonitor {

    private ILogger logger;

    public BatteryMonitor(ILogger logger) {
        this.logger = logger;
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

---