## 🏦 VirtualATM – Full-Stack ATM Simulator

**Live Demo:** 👉 https://virtual-atm.vercel.app

A production-grade Virtual ATM System built using React, Node.js, Express, and MySQL, designed to simulate how a real-world ATM network works — including secure authentication, session control, audit logging, cash management, and transaction safety.

It replicates how an actual ATM operates — from card insertion → PIN verification → session creation → transactions → audit trails → auto-logout.

---

## 🚀 Key Features

**🔐 Security & Authentication**

3-attempt PIN locking

Temporary lock & auto-unlock

Card expiry detection

Card status tracking (ACTIVE, BLOCKED, LOST, EXPIRED)

Concurrent session prevention

Auto session timeout


**💳 Banking Operations**

Cash Withdrawal (denomination-aware)

Cash Deposit

Fund Transfer

Balance Enquiry

Mini Statement

PIN Change


**🏧 ATM Intelligence**

ATM cash availability validation

Exact denomination calculation

ATM cash balance tracking

Withdrawal blocking when ATM is empty


**🧾 Audit & Compliance**

Login & logout tracking

PIN change history

Session timeout logs

Success & failure tracking

JSON-based activity metadata

---

## 🧠 System Architecture
```bash
React Frontend
      ↓
Express API (Controllers)
      ↓
MySQL Database
      ↓
Transactions + Row Locks
      ↓
Audit Logs & Sessions
```

**Design Pattern**

Route → Controller → Database (ACID Transactions)

---

## 🗄️ Database Design

**Core Tables**

customers

accounts

atm_cards

atm_machines

atm_sessions

transactions

atm_denominations

audit_logs


**Relationships**

One customer → many accounts

One account → one ATM card

One ATM → many sessions & transactions

One card → many transactions, logs & sessions


**Engineering**

Foreign keys

Unique constraints

Check constraints

Row-level locking (FOR UPDATE)

ACID-compliant transactions

---

## 🧩 Backend Tech Stack

Node.js

Express.js

MySQL

mysql2 (promise)

dotenv

CORS


**Engineering Practices**

START TRANSACTION / COMMIT / ROLLBACK

Row locking for money movement

Atomic balance updates

Audit logging for sensitive actions

Denomination-aware withdrawals

---

## 🌐 API Highlights

```bash
**🔐 ATM**

Action	Endpoint

Insert Card	POST /api/atm/card/insert

Validate PIN	POST /api/atm/card/validate

Start Session	POST /api/atm/session/start

End Session	POST /api/atm/session/end

Block Card	POST /api/atm/card/block


**💰 Transactions**

Action	Endpoint

Withdraw	POST /api/transactions/withdraw

Deposit	POST /api/transactions/deposit

Transfer	POST /api/transactions/transfer

Mini Statement	GET /api/transactions/statement


**👤 Accounts**

Action	Endpoint

Balance	GET /api/accounts/balance

Account Info	GET /api/accounts
```bash

---

## 🖥️ Frontend Tech Stack

React 19

Vite

Tailwind CSS v4

Framer Motion

React Router v7

Axios

TanStack React Query

Shadcn UI

Radix UI

Sonner / Toast


**🔁 Session Handling**

Session created after PIN verification

Stored in React Context + sessionStorage

Auto logout on inactivity

Backend session closed automatically

Protected routes block unauthorized access

---

## ▶️ Running the Project

```bash
# Backend
cd backend
npm install
node server.js

Runs on
http://localhost:5000


## Frontend
cd frontend
npm install
npm run dev

Runs on
http://localhost:5173
```


**🧪 Example Test Cards**
```bash
  Card Number     	PIN

9014302429901430	     9014

9491943909949194	     9491

ATM ID: 1
```
