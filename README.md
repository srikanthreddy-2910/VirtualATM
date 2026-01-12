🏦 VirtualATM – Full Stack ATM Simulator

A production-grade Virtual ATM system built with React, Node.js, Express, and MySQL, designed to simulate a real-world ATM with secure banking operations, session handling, audit logging, cash denomination management, and concurrency control.

This project replicates how an actual ATM works — from card insertion → PIN validation → session creation → transactions → audit trails → auto logout — using enterprise-level backend design and a ATM-style frontend.

🚀 Features
🔐 Security & Authentication

Encrypted PIN storage

3-attempt PIN locking

Temporary lock & auto-unlock

Card expiry detection

Card status tracking (ACTIVE, BLOCKED, LOST, etc)

Concurrent session prevention

Auto session timeout

💳 Banking Operations

Cash Withdrawal (denomination-aware)

Cash Deposit

Fund Transfer

Balance Enquiry

Mini Statement

PIN Change

🏧 ATM Intelligence

Cash availability validation

Exact denomination validation

Cash balance tracking per ATM

🧾 Audit & Compliance

Login / logout logs

PIN change tracking

Session timeout logs

Failure and success tracking

JSON-based activity details

🧠 System Architecture
React Frontend → Express API → MySQL Database
│ │ │
Session Context Controllers Transactions + Locks

Design Pattern:

Route → Controller → MySQL (Transaction-Safe)

🗄️ Database Design

The database follows banking-grade relational modeling:

Core tables

customers

accounts

atm_cards

atm_machines

transactions

atm_denominations

audit_logs

atm_sessions

Supports:

One customer → many accounts

One account → one ATM card

One ATM → many sessions & transactions

One card → many transactions, logs, sessions

Built with:

Foreign keys

Check constraints

Unique constraints

Row-level locking (FOR UPDATE)

ACID-compliant transactions

🧩 Backend
🛠 Tech Stack

Node.js

Express.js

MySQL

mysql2 (promise)

dotenv

CORS

📁 Folder Structure
backend/
├── src/
│ ├── config/
│ ├── controllers/
│ ├── routes/
│ └── utils/
└── server.js

🔒 Key Engineering Practices

START TRANSACTION / COMMIT / ROLLBACK

Row locking for money movement

Atomic cash updates

Audit logging for all sensitive actions

Denomination-aware withdrawals

🌐 API Highlights
🔐 ATM
Action Endpoint
Insert Card POST /api/atm/card/insert
Validate PIN POST /api/atm/card/validate
Start Session POST /api/atm/session/start
End Session POST /api/atm/session/end
Block Card POST /api/atm/card/block
💰 Transactions
Action Endpoint
Withdraw POST /api/transactions/withdraw
Deposit POST /api/transactions/deposit
Transfer POST /api/transactions/transfer
Mini Statement GET /api/transactions/statement
👤 Accounts
Action Endpoint
Balance GET /api/accounts/balance
Account Info GET /api/accounts
🖥️ Frontend
🧰 Tech Stack

React 19

Vite

Tailwind CSS v4

Framer Motion

React Router v7

Axios

TanStack React Query

Shadcn UI

Radix UI

Sonner & Toast

🔁 Session Handling

Session created after PIN verification

Stored in React Context + sessionStorage

Auto logout after inactivity

Backend session end is called automatically

Protected routes block unauthorized access

🧠 Why This Project Is Special

This is not just CRUD.

This system implements real banking logic:

Daily withdrawal limits

ATM cash exhaustion handling

Denomination-based payouts

PIN security rules

Session isolation

Transaction atomicity

Compliance-grade audit trails

This is how real ATM networks are designed.

▶️ Running the Project
Backend
cd backend
npm install
node server.js

Runs on
http://localhost:5000

Frontend
cd frontend
npm install
npm run dev

Runs on
http://localhost:5173

🧪 Test Card (Example)
Card Number: 9014302429901430
PIN: 9014

Card Number:9491943909949194
PIN: 9491

ATM ID: 1

📄 Resume-Ready Project Description

You can paste this directly into your resume, LinkedIn, or portfolio.

VirtualATM – Full Stack ATM Banking Simulator

Tech Stack:
React, Vite, Tailwind CSS, Framer Motion, Node.js, Express, MySQL, Axios, bcrypt

Designed and built a production-grade ATM simulation system that replicates the complete lifecycle of a real ATM including card authentication, PIN security, session management, cash withdrawal, deposits, fund transfers, audit logging, and denomination tracking.

Built a transaction-safe backend using MySQL with row-level locking, foreign keys, and ACID-compliant operations to ensure accurate handling of money, prevent race conditions, and maintain banking-grade data integrity.

Implemented:

Secure PIN verification with hashing, failed attempt tracking, and temporary card locking

Session-based ATM flow with auto-logout and concurrent session prevention

Denomination-aware withdrawals validating exact note availability before dispensing

Daily withdrawal limits and account balance enforcement

Audit logging system capturing all security-sensitive actions (login, PIN change, failures, timeouts)

Real-time ATM cash management and online/offline detection
