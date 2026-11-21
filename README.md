# 🏢 Employee Leave Management System (HR Portal)

A modern full-stack web application designed for enterprise leave tracking and approvals. Built using **ASP.NET Core 8 Web API (C#)** for the backend and **React (Vite + Tailwind CSS)** for the frontend.

---

## 🚀 Quick Start (1-Click Run)

Simply double-click:
📁 **`run-all.bat`**

This will automatically:
1. Start the **ASP.NET Core 8 Web API** at `http://localhost:5147` (with Swagger UI at `http://localhost:5147/swagger`).
2. Start the **React Frontend** at `http://localhost:5173`.
3. Open your browser directly to the web portal!

*(Alternatively, you can run `run-backend.bat` and `run-frontend.bat` in separate terminals).*

---

## 👥 Pre-Configured Test Accounts

The database (SQLite) is automatically generated and populated on the first backend run. You can use these default accounts or create custom users via the registration portal:

| Role | Email | Password | Full Name | Department | Permissions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Manager** | `manager@company.com` | `Manager@123` | Kamal Perera | Engineering | Review team leaves, approve/reject with remarks, view stats |
| **Employee** | `employee@company.com` | `Employee@123` | Nimal Silva | Engineering | Check leave balances, apply for leaves, track history |
| **Employee 2** | `sunil@company.com` | `Sunil@123` | Sunil Fernando | QA Automation | Apply for leaves, check balance |

---

## 🛠️ Technical Stack & Architecture

### Backend (.NET 8 Web API)
* **Framework:** ASP.NET Core 8 Web API (C#)
* **Database & ORM:** Entity Framework Core (EF Core) 8 with **SQLite** (`leave_management.db`)
* **Security & Auth:** ASP.NET Core Identity + **JWT (JSON Web Tokens)** with Claims-Based Authorization
* **API Documentation:** Swagger / OpenAPI with JWT Bearer support
* **Design Patterns:** Controller-Service Pattern, DTOs (Data Transfer Objects), Code-First Database Seeding

### Frontend (React)
* **Build Tool:** Vite + React 18
* **Styling:** Tailwind CSS + Lucide Icons
* **Routing & State:** React Router DOM v6 + Auth Context API
* **HTTP Client:** Axios with JWT Interceptors and 401 handling

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)
* `POST /api/auth/login` - Authenticate user & return JWT token + user profile.
* `POST /api/auth/register` - Register a new employee/manager.
* `GET /api/auth/me` - Get profile of the currently logged-in user.

### 📅 Leave Requests (`/api/leaverequests`)
* `POST /api/leaverequests/apply` - Apply for leave (validates duration & remaining balance).
* `GET /api/leaverequests/my-leaves` - Get all leaves for the logged-in employee.
* `GET /api/leaverequests/pending` - *(Manager only)* Get pending leave requests awaiting approval.
* `GET /api/leaverequests/all` - *(Manager only)* Get all organizational leave records.
* `PUT /api/leaverequests/{id}/status` - *(Manager only)* Approve or Reject request (auto-deducts balance upon approval).
* `GET /api/leaverequests/balance` - Get employee's Annual, Casual, and Medical leave balances.
* `DELETE /api/leaverequests/{id}/cancel` - Cancel a pending leave request.

### 📊 Dashboard & Settings (`/api/dashboard`, `/api/leavetypes`)
* `GET /api/dashboard/stats` - Summary counts for team size, pending approvals, and approved leaves.
* `GET /api/leavetypes` - Get list of leave types (Annual, Casual, Medical).

---

## 🏛️ Key Architectural & Design Decisions

### 1. Authentication & Role-Based Authorization
The API combines ASP.NET Core Identity with stateless JSON Web Tokens (JWT). When authenticating, claims including `NameIdentifier`, `Email`, `Role`, and `Department` are cryptographically signed into the token. Protected endpoints utilize claims-based policies (`[Authorize(Roles = "Manager,Admin")]`), while the React client injects the token automatically through an Axios request interceptor.

### 2. DTO Layer & Domain Decoupling
Data Transfer Objects (DTOs) strictly isolate Entity Framework core models from client payloads. This eliminates over-posting vulnerabilities, strips out circular navigation references during JSON serialization, and optimizes network bandwidth by sending only necessary fields.

### 3. Business Logic & Leave Balance Transactions
When approving a request, business validation checks enforce that requested days do not exceed real-time available quotas for the specific category (Annual, Casual, Medical) and atomically decrement user balances upon approval.
