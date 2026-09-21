# System Architecture - College Maintenance Request System

## 1. High-Level Architecture Overview

The **College Maintenance Request System** is designed as a decoupled, 3-tier enterprise web application adhering to clean architecture and RESTful design principles.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION TIER                               │
│  Pure HTML5 + Modern CSS3 Design Tokens + Modular ES6 JavaScript       │
│  Portals: Student Dashboard | Admin Console | Technician Workspace     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON + JWT Bearer Auth
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION & API TIER                          │
│  Spring Boot 3.x / Java 17+ Backend Engine                             │
│  ├── Security Layer: Spring Security, BCrypt Hashing, JWT Filter      │
│  ├── Controller Layer: Auth, Student, Admin, Technician REST Endpoints │
│  ├── Service Layer: Business Logic, Triage, Role-Based Access Control  │
│  └── Data Access: Spring Data JPA + Hibernate ORM                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ JDBC Driver (HikariCP)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         PERSISTENCE TIER                               │
│  MySQL Relational Database                                             │
│  ├── users (Role-Based Identity)                                       │
│  ├── maintenance_requests (Core Tickets & State)                       │
│  └── request_updates (Immutable Audit Logs & Status Timeline)          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Layers & Responsibility

### Presentation Tier (Frontend)
- **Zero Framework Bloat**: Native HTML, CSS, and Vanilla JavaScript for ultra-fast load times and zero build dependencies.
- **Session & Token Management**: Securely persists JWT tokens in client-side storage, dynamically attaches `Authorization: Bearer <token>` to outbound requests, and handles automated session expiry redirects.
- **Analytics & Data Visualization**: Utilizes Chart.js for real-time category distribution doughnut charts and request status pipeline bar charts.

### Application Tier (Backend)
- **Spring Security + JWT**: Stateless authentication mechanism ensuring student, admin, and technician role-based access control.
- **Service Layer**: Implements business transactions, prevents unauthorized cross-student ticket inspection, validates status transitions, and writes immutable audit logs.
- **Data Transfer Objects (DTOs)**: Enforces strong typing, input validation constraints, and protects internal entity representations.

### Persistence Tier (Database)
- **Relational Integrity**: Foreign key constraints linking student creators, assigned technicians, and sequential request update histories.

---

## 3. REST API Contract Reference

### Authentication APIs
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new student account |
| `POST` | `/api/auth/login` | Public | Authenticate user and issue JWT |

### Student APIs
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/requests` | `STUDENT` | Submit a new maintenance ticket |
| `GET` | `/api/requests/my` | `STUDENT` | Retrieve student's own requests |
| `GET` | `/api/requests/{id}` | `STUDENT` | View request details and timeline |
| `GET` | `/api/requests/dashboard` | `STUDENT` | Retrieve student personal stats |

### Facility Admin APIs
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | `ADMIN` | System KPIs, category counts, recent items |
| `GET` | `/api/admin/requests` | `ADMIN` | Query all requests with search/filters |
| `GET` | `/api/admin/requests/{id}` | `ADMIN` | Full request inspection |
| `PUT` | `/api/admin/requests/{id}/assign` | `ADMIN` | Assign technician to ticket |
| `PUT` | `/api/admin/requests/{id}/priority` | `ADMIN` | Adjust ticket priority |
| `PUT` | `/api/admin/requests/{id}/reject` | `ADMIN` | Reject invalid request |
| `GET` | `/api/admin/technicians` | `ADMIN` | List all campus technicians |
| `POST` | `/api/admin/technicians` | `ADMIN` | Register new technician account |

### Technician APIs
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/technician/dashboard` | `TECHNICIAN` | Technician KPI summary & task list |
| `GET` | `/api/technician/requests` | `TECHNICIAN` | List assigned requests |
| `GET` | `/api/technician/requests/{id}` | `TECHNICIAN` | Inspect assigned ticket details |
| `PUT` | `/api/technician/requests/{id}/start` | `TECHNICIAN` | Mark task as `IN_PROGRESS` |
| `PUT` | `/api/technician/requests/{id}/resolve` | `TECHNICIAN` | Mark as `RESOLVED` with fix notes |
