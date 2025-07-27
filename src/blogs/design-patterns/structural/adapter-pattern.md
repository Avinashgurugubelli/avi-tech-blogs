<!--
author: "Avinash Gurugubelli",
title: "Adapter Design Pattern",
description: "Explains how the Adapter pattern allows incompatible interfaces to communicate by wrapping existing classes, supported by Java code samples.",
tags: ["Adapter Pattern", "Design Patterns", "Structural", "Java", "OOP", "Interface Compatibility"],
references: []
-->

# Adapter pattern

- When two heads of states who don't speak a common language meet,
usually a language interpreter sits between the two and translates the
conversation, thus enabling communication. The Adapter pattern is
similar in that it sits between two incompatible classes that otherwise
can't work with each other and lets them work together.

- Formally, the adapter pattern is defined as allowing incompatible
classes to work together by converting the interface of one class into
another expected by the clients

- It is often used to make existing classes work with others without modifying their source code.

## Example

- Lets take the general example, say we have Android phone and Iphone.
  - Android phone gets recharged or charged using Micro USB cable.
  - Iphone gets recharged or charged using Lighting cable.
  - Assume the Android user lost the micro usb cable and wants to charge the android phone with Lighting cable. Since both the interfaces are different, user can not directly connect the lighting cable to Android, so what he can do is connect phone via LightningToMicroUsbAdapter.

## Code

``` Java
    interface ILightningPhone {
        void recharge();
        void useLightning();
    }

    interface IMicroUsbPhone {
        void recharge();
        void useMicroUsb();
    }

    class Iphone implements ILightningPhone {
        private boolean connector;

        @Override
        public void useLightning() {
            connector = true;
            System.out.println("Lightning connected");
        }

        @Override
        public void recharge() {
            if (connector) {
                System.out.println("Recharge started");
                System.out.println("Recharge finished");
            } else {
                System.out.println("Connect Lightning first");
            }
        }
    }

    class Android implements IMicroUsbPhone {
        private boolean connector;

        @Override
        public void useMicroUsb() {
            connector = true;
            System.out.println("MicroUsb connected");
        }

        @Override
        public void recharge() {
            if (connector) {
                System.out.println("Recharge started");
                System.out.println("Recharge finished");
            } else {
                System.out.println("Connect MicroUsb first");
            }
        }
    }
    /* exposing the target interface while wrapping source object */
    class LightningToMicroUsbAdapter implements IMicroUsbPhone {
        private final ILightningPhone lightningPhone;

        public LightningToMicroUsbAdapter(ILightningPhone lightningPhone) {
            this.lightningPhone = lightningPhone;
        }

        @Override
        public void useMicroUsb() {
            System.out.println("MicroUsb connected");
            lightningPhone.useLightning();
        }

        @Override
        public void recharge() {
            lightningPhone.recharge();
        }
    }

    public class AdapterDemo {
        static void rechargeMicroUsbPhone(IMicroUsbPhone phone) {
            phone.useMicroUsb();
            phone.recharge();
        }

        static void rechargeLightningPhone(ILightningPhone phone) {
            phone.useLightning();
            phone.recharge();
        }

        public static void main(String[] args) {
            Android android = new Android();
            Iphone iPhone = new Iphone();

            System.out.println("Recharging android with MicroUsb");
            rechargeMicroUsbPhone(android);

            System.out.println("Recharging iPhone with Lightning");
            rechargeLightningPhone(iPhone);

            System.out.println("Recharging iPhone with MicroUsb, via LightningToMicroUsbAdapter");
            rechargeMicroUsbPhone(new LightningToMicroUsbAdapter (iPhone));
        }
    }
```

### Output

```
Recharging android with MicroUsb
MicroUsb connected
Recharge started
Recharge finished
Recharging iPhone with Lightning
Lightning connected
Recharge started
Recharge finished
Recharging iPhone with MicroUsb, via LightningToMicroUsbAdapter
MicroUsb connected
Lightning connected
Recharge started
Recharge finished
```

## UML

![Adapter-Pattern](../resources/adapter-pattern.png)