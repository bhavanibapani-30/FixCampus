# 🏫 FixCampus - College Maintenance Request System

A modern, full-stack, enterprise-grade campus facility ticketing and maintenance dispatch management system built specifically for college campus infrastructure (Students, Faculty, Technicians, and Facility Administrators).

---

## 📑 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Key Features by Role](#-key-features-by-role)
- [Security & Access Verification](#-security--access-verification)
- [Pre-configured Demo Accounts](#-pre-configured-demo-accounts)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Backend Setup Guide](#-backend-setup-guide)
- [Frontend Setup Guide](#-frontend-setup-guide)
- [REST API Reference](#-rest-api-reference)
- [License & Credits](#-license--credits)

---

## 🌟 Overview

**FixCampus** bridges the gap between campus facility issues (broken projectors, leaking water coolers, faulty fans/ACs, damaged desks, Wi-Fi drops) and quick resolution. It provides a transparent, auditable, and automated ticket lifecycle:
`PENDING ➔ ASSIGNED ➔ IN_PROGRESS ➔ RESOLVED (or REJECTED)`

---

## 🏛️ System Architecture

The application is structured into decoupled layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION TIER (Frontend)                    │
│  React 19 + Vite + Vanilla CSS Custom Design Tokens + Lucide Icons     │
│  Portals: Reporter (Student/Faculty) | Technician Desk | Admin Console │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON (JWT Bearer Token)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     APPLICATION & API TIER (Backend)                   │
│  Spring Boot 4.x / Java 17+                                            │
│  ├── Security: Spring Security, BCrypt Hashing, JWT Filter             │
│  ├── REST API: AuthController, RequestController,                      │
│  │             AdminController, TechnicianController                   │
│  ├── Services: Business validation, triage, state machine transitions  │
│  └── Persistence: Spring Data JPA + Hibernate ORM                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ JDBC Connection Pool (HikariCP)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        DATABASE TIER (Persistence)                     │
│  MySQL 8.0 Relational Database (college_maintenance_db)               │
│  ├── users (Roles: STUDENT, FACULTY, TECHNICIAN, ADMIN)                │
│  ├── maintenance_requests (Core ticket metadata, category, status)     │
│  └── request_updates (Audit trail logs & status history)               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Key Features by Role

### 🎓 1. Student & Faculty (Reporters)
- **Submit Facility Issues**: Choose from categories (Electrical, Fan/AC, Wi-Fi, Water/Plumbing, Furniture, Projector, Other), specify location, priority, and description.
- **Track Status in Real-Time**: View color-coded ticket progress (`PENDING`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`).
- **Complete Timeline Audit**: Inspect step-by-step history including which technician was assigned and technician resolution notes.

### 🛠️ 2. Technicians
- **Assigned Job Queue**: View tickets assigned specifically to the logged-in technician.
- **Start Work (`IN_PROGRESS`)**: One-click status update notifying administrators and reporters that on-site repair has begun.
- **Resolution & Sign-Off (`RESOLVED`)**: Submit technical resolution notes detailing what parts were replaced or repaired.

### 🛡️ 3. Facility Administrators
- **Executive KPI Dashboard**: Live counts of total requests, pending triage, ongoing work, resolved issues, and urgent requests.
- **Ticket Triage & Dispatch**: Assign specialized technicians to pending issues, update priorities, or reject out-of-scope requests with reason comments.
- **Advanced Filtering**: Filter tickets instantly by status, category, priority, or keyword search.
- **Technician Management**: View all technicians and onboard new verified technical staff directly.

---

## 🔒 Security & Access Verification

1. **Strict Institutional Email Verification**:
   - Outsiders with generic public email domains (e.g., `@gmail.com`, `@yahoo.com`) are strictly rejected.
   - Only official college email addresses adhering to the **10-character institutional pattern** before `@anurag.edu.in` are permitted:
     - Example: `21h61a0501@anurag.edu.in`, `faculty001@anurag.edu.in`, `tech000001@anurag.edu.in`.
2. **Role Authorization Keys**:
   - **Admin Portal**: Self-registration of administrator accounts is disabled. Administrative access requires the master security key (`CMS-ADMIN-2026`).
   - **Technician Registration**: Requires staff verification key (`CMS-TECH-2026`).
3. **Stateless JWT Security**:
   - Passwords securely hashed with BCrypt.
   - All protected REST API requests require a valid Bearer JWT header.

---

## 👥 Pre-configured Demo Accounts

The backend includes a seed initializer (`DataInitializer`) that pre-populates default accounts and sample tickets on startup:

| Role | Name | Email | Password | Required Key |
|---|---|---|---|---|
| 🛡️ **Admin** | System Administrator | `admin00001@anurag.edu.in` | `Admin@123` | Security Key: `CMS-ADMIN-2026` |
| ⚡ **Technician (Electrical)** | John Sparks | `tech000001@anurag.edu.in` | `Tech@123` | Staff Key: `CMS-TECH-2026` |
| 📡 **Technician (Wi-Fi/IT)** | Sarah Fiber | `tech000002@anurag.edu.in` | `Tech@123` | Staff Key: `CMS-TECH-2026` |
| 🔧 **Technician (Plumbing)** | Robert Woods | `tech000003@anurag.edu.in` | `Tech@123` | Staff Key: `CMS-TECH-2026` |
| 📽️ **Technician (Projector)** | David Screen | `tech000004@anurag.edu.in` | `Tech@123` | Staff Key: `CMS-TECH-2026` |
| 🎓 **Student** | Alex Johnson (Roll: 21H61A0501) | `21h61a0501@anurag.edu.in` | `Student@123` | *(None)* |
| 🎓 **Student** | Emily Davis (Roll: 22H61A0502) | `22h61a0502@anurag.edu.in` | `Student@123` | *(None)* |
| 👨‍🏫 **Faculty** | Dr. Rajesh Sharma | `faculty001@anurag.edu.in` | `Faculty@123` | *(None)* |

---

## 📁 Project Structure

```
my_project/
├── README.md                      # Comprehensive project documentation
├── docs/                          # Architecture, ER diagram & workflow docs
│   ├── architecture.md
│   ├── er-diagram.md
│   └── workflow.md
├── backend/                       # Spring Boot 4.x / Java 17 backend
│   ├── mvnw / mvnw.cmd            # Maven wrapper
│   ├── pom.xml                    # Maven dependencies
│   └── src/
│       ├── main/
│       │   ├── java/app/
│       │   │   ├── config/        # SecurityConfig, DataInitializer
│       │   │   ├── controller/    # REST API Controllers (Auth, Request, Admin, Technician)
│       │   │   ├── dto/           # Request/Response Data Transfer Objects
│       │   │   ├── entity/        # JPA Entities (User, MaintenanceRequest, RequestUpdate)
│       │   │   ├── repository/    # Spring Data JPA Repositories
│       │   │   ├── security/      # JWT Filter & Token Utility
│       │   │   └── service/       # Business Logic & Validation Services
│       │   └── resources/
│       │       └── application.properties # Server port, DB, and JWT configuration
│       └── test/                  # Automated integration tests
└── frontend/                      # React 19 + Vite frontend
    ├── index.html                 # HTML shell
    ├── package.json               # NPM packages & build scripts
    ├── vite.config.js             # Vite configuration
    └── src/
        ├── App.jsx                # Main application component & routing
        ├── index.css              # Custom design system & theme tokens
        ├── context/               # AuthContext state provider
        ├── services/api.js        # Axios/Fetch API client and institutional domain validators
        └── components/
            ├── Auth/              # Login & Register views
            ├── Reporter/          # Student/Faculty ticket management & dashboard
            ├── Technician/        # Technician job execution workspace
            ├── Admin/             # Facility Admin triage console
            └── Shared/            # Modal & reusable timeline dialogs
```

---

## 🛠️ Prerequisites

Before getting started, make sure you have the following installed:

- **Java JDK**: Version 17 or higher (Java 17, 21, or 26)
- **Node.js**: Version 18.x or higher and **npm**
- **MySQL Server**: Version 8.0 or higher
- **Git**

---

## 🚀 Backend Setup Guide

### 1. Database Creation
Open MySQL Command Line Client or MySQL Workbench and create the database:

```sql
CREATE DATABASE college_maintenance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configure Database Credentials
Verify or update `backend/src/main/resources/application.properties` with your local MySQL credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/college_maintenance_db
spring.datasource.username=root
spring.datasource.password=YourMySQLPassword
```

### 3. Run the Backend Server
Navigate to the `backend` directory and start the Spring Boot application using the Maven wrapper:

- **On Windows (PowerShell / CMD)**:
  ```powershell
  cd backend
  .\mvnw.cmd spring-boot:run
  ```
- **On Linux / macOS**:
  ```bash
  cd backend
  ./mvnw spring-boot:run
  ```

The backend server starts at: **`http://localhost:8080`**

*(Note: On first startup, `DataInitializer` automatically builds tables and inserts default users and demo tickets.)*

---

## 💻 Frontend Setup Guide

### 1. Install Dependencies
Open a separate terminal window and navigate to the `frontend` folder:

```bash
cd frontend
npm install
```

### 2. Start the Development Server
Run the Vite development server:

```bash
npm run dev
```

The application will be accessible at: **`http://localhost:5173/`**

### 3. Build for Production
To generate an optimized production bundle:

```bash
npm run build
```

Production output will be generated in `frontend/dist/`.

---

## 📡 REST API Reference

All endpoints (except public auth) require the HTTP header:
`Authorization: Bearer <jwt_token>`

### 🔑 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new Student, Faculty, or Technician |
| `POST` | `/api/auth/login` | Public | Login with email & password (optional admin key) |

### 📝 Reporter Requests (`/api/requests`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/requests` | Student / Faculty | Create new maintenance ticket |
| `GET` | `/api/requests/my` | Student / Faculty | Fetch tickets submitted by current user |
| `GET` | `/api/requests/{id}` | Authenticated | Fetch full ticket details and status timeline |
| `GET` | `/api/requests/dashboard-stats` | Student / Faculty | Summary counters for reporter dashboard |

### 🛠️ Technician Endpoints (`/api/technician`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/technician/my-requests` | Technician | Get all jobs assigned to the current technician |
| `GET` | `/api/technician/dashboard-stats` | Technician | Technician dashboard KPIs |
| `PUT` | `/api/technician/requests/{id}/start` | Technician | Change status to `IN_PROGRESS` |
| `PUT` | `/api/technician/requests/{id}/resolve` | Technician | Mark ticket as `RESOLVED` with notes |

### 🛡️ Admin Endpoints (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/requests` | Admin | Get all tickets with optional filtering |
| `GET` | `/api/admin/dashboard-stats` | Admin | System-wide statistics and metrics |
| `GET` | `/api/admin/technicians` | Admin | List all registered technicians |
| `POST` | `/api/admin/technicians` | Admin | Create a new technician account |
| `PUT` | `/api/admin/requests/{id}/assign` | Admin | Assign ticket to a technician (`ASSIGNED`) |
| `PUT` | `/api/admin/requests/{id}/priority`| Admin | Update priority of a ticket |
| `PUT` | `/api/admin/requests/{id}/reject` | Admin | Reject an invalid request (`REJECTED`) |

---

## 📄 License & Credits

Developed for the **College Maintenance Request System (FixCampus)**.  
Built with Spring Boot, React, Vite, MySQL, and modern Web standards.
