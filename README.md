# 🍽️ DineQR Backend

> **Modern, Scalable, and Real-time Restaurant Management Backend**  
> Built with **TypeScript, Express, MongoDB, Redis, Socket.IO, Razorpay, SendGrid, Twilio, and AWS S3**,  
> the DineQR backend powers QR-based guest dining, live orders, OTP authentication, payments, and real-time updates — all in one seamless ecosystem.

---

## 🚀 Overview

The **DineQR Backend** serves as the central hub of the DineQR platform — managing guests, staff, and managers.  
It handles authentication, payments, live WebSocket updates, email and SMS communication, image uploads, and more — optimized for performance and security.

Guests scan a **table QR code**, log in with their **mobile number (via Twilio OTP)**, browse dishes, and order in real time.  
Orders appear instantly in the **staff dashboard**, and **managers** get full control of menus, staff, and analytics.

---

## 🧩 Key Features

### 👥 Multi-Role System
- **Manager** – Manage menus, track revenue, and monitor all activity.  
- **Staff** – Handle live kitchen operations and update order statuses.  
- **Guest** – Scan QR → Login via OTP → Place and track orders live.

---

### 🔐 Authentication & Security
- Login via **Twilio OTP** (no password required)
- **JWT tokens** stored in **HttpOnly cookies**
- **Auth middleware** protects every private API route
- Passwords securely hashed with **bcrypt**
- Responses optimized using **data compression**
- Strict **CORS**, **Helmet**, and **rate limiting** applied
- Complete `try–catch` safety and centralized error handler

---

### ⚡ Real-Time System
- Powered by **Socket.IO** for live order updates
- Guests, staff, and managers stay synced instantly
- **Redis** used for fast session caching and socket event optimization
- Real-time **notifications** and **live email updates** via SendGrid

---

### 💳 Payment & Transaction Flow
- Integrated with **Razorpay** for secure online transactions
- Supports both 💳 **Pay Online** and 💵 **Pay Later / Cash**
- Validates Razorpay signature & transaction status server-side
- Updates order state and notifies users in real-time

---

### 📨 Communication & Notifications

| Service | Purpose |
|----------|----------|
| **SendGrid** | Email notifications for orders, updates, and receipts |
| **Twilio** | OTP authentication via SMS |
| **Socket.IO** | Real-time updates between all users |
| **Redis** | Session caching, OTP TTL storage, WebSocket speed boost |

---

### 🗃️ Data & Media Management
- Images stored in **AWS S3 bucket** with public access URLs  
- **BlurHash** used for fast, blurred image placeholders  
- **Redis** caches menus, OTPs, and live session states  
- Uses **LocalForage** and **Session Storage** on frontend for offline sync  

---

### 🧠 Developer Architecture
- Built entirely in **TypeScript** with strong typing  
- **Modular MVC** design: Controllers, Models, Middleware, Routes  
- **Reusable Routes** for quick-order, logout, and OTP flows  
- **Async/Await** with proper error handling  
- Centralized **error handler** and **JWT verification middleware**  
- **Optimized compression** for improved API performance  

---

## 🧠 Tech Stack

| Category | Technology |
|-----------|-------------|
| **Language** | TypeScript |
| **Framework** | Express.js |
| **Database** | MongoDB + Mongoose |
| **Cache / Queue** | Redis |
| **Realtime** | Socket.IO |
| **Auth** | JWT + HttpOnly Cookies |
| **OTP Service** | Twilio |
| **Email Service** | SendGrid |
| **Payments** | Razorpay |
| **File Storage** | AWS S3 |
| **Encryption** | bcrypt |
| **Compression** | zlib / express-compression |
| **Hosting** | Render |
| **Domain** | `https://api.dineqr.cfd` |

---


