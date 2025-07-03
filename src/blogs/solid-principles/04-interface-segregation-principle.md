<!--
author: "Avinash Gurugubelli",
title: "Interface Segregation Principle",
description: "Exploring Interface Segregation Principle with examples to reduce fat interfaces and improve code decoupling.",
tags: ["SOLID", "ISP", "Interface Design", "Java", "OOP"],
references: []
-->


## 3. Interface Segregation Principle (ISP)

The **I** in SOLID stands for interface segregation, and it simply means that larger interfaces should be split into smaller ones. By doing so, we can ensure that implementing classes only need to be concerned about the methods that are of interest to them.
> Clients should not be forced to depend on interfaces they do not use.

If you had this:

```java
public interface ILogger {
    void log(String message);
    void archiveFileLog();
    void clearConsole();
}
```

...your `ConsoleLogger` and `FileLogger` would need to implement irrelevant methods.

### ✅ Applying ISP

```java
public interface ILogger {
    void log(String message);
}

public interface IConsoleLogger extends ILogger {
    void clearConsole();
}

public interface IFileLogger extends ILogger {
    void archiveFileLog();
}
```

### ✅ Concrete Implementations

```java
public class ConsoleLogger implements IConsoleLogger {
    public void log(String message) {
        System.out.println(message);
    }

    public void clearConsole() {
        // Implementation to clear console
    }
}

public class FileLogger implements IFileLogger {
    public void log(String message) {
        // Write to file
    }

    public void archiveFileLog() {
        // Archive logic
    }
}
```