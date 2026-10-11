
# Entity Relationship (ER) Diagram & Database Schema

## 1. Entity Relationship Diagram

```
┌────────────────────────────────────────────────────────┐
│                        users                           │
├────────────────────────┬───────────────────────────────┤
│ id                     │ BIGINT (PK, Auto-Increment)   │
│ name                   │ VARCHAR(255) NOT NULL         │
│ email                  │ VARCHAR(255) NOT NULL UNIQUE  │
│ password               │ VARCHAR(255) NOT NULL         │
│ role                   │ VARCHAR(20) NOT NULL          │
│ created_at             │ DATETIME NOT NULL             │
└────────────────────────┴───────────────────────────────┘
          │ (1)                             │ (1)
          │                                 │
          │ created_by (1:N)                │ assigned_to (1:N)
          ▼                                 ▼
┌────────────────────────────────────────────────────────┐
│                 maintenance_requests                   │
├────────────────────────┬───────────────────────────────┤
│ id                     │ BIGINT (PK, Auto-Increment)   │
│ title                  │ VARCHAR(255) NOT NULL         │
│ description            │ TEXT NOT NULL                 │
│ category               │ VARCHAR(30) NOT NULL          │
│ location               │ VARCHAR(255) NOT NULL         │
│ priority               │ VARCHAR(20) NOT NULL          │
│ status                 │ VARCHAR(20) NOT NULL          │
│ student_id             │ BIGINT NOT NULL (FK -> users) │
│ technician_id          │ BIGINT (FK -> users, NULL)    │
│ resolution_notes       │ TEXT                          │
│ created_at             │ DATETIME NOT NULL             │
│ updated_at             │ DATETIME                      │
└────────────────────────┴───────────────────────────────┘
          │ (1)
          │
          │ audit_history (1:N)
          ▼
┌────────────────────────────────────────────────────────┐
│                   request_updates                      │
├────────────────────────┬───────────────────────────────┤
│ id                     │ BIGINT (PK, Auto-Increment)   │
│ request_id             │ BIGINT NOT NULL (FK -> reqs)  │
│ updated_by_id          │ BIGINT NOT NULL (FK -> users) │
│ old_status             │ VARCHAR(20)                   │
│ new_status             │ VARCHAR(20) NOT NULL          │
│ comment                │ TEXT                          │
│ created_at             │ DATETIME NOT NULL             │
└────────────────────────┴───────────────────────────────┘
```

---

## 2. Table Specifications & Constraints

### 1. `users` Table
Stores authentication credentials and role assignments for all system participants.
- `id` (Primary Key): `BIGINT AUTO_INCREMENT`
- `name`: `VARCHAR(255)`
- `email`: `VARCHAR(255) UNIQUE`
- `password`: `VARCHAR(255)` (BCrypt Hashed)
- `role`: `ENUM('STUDENT', 'ADMIN', 'TECHNICIAN')`
- `created_at`: `DATETIME`

### 2. `maintenance_requests` Table
Core entity capturing reported infrastructure tickets and current operational state.
- `id` (Primary Key): `BIGINT AUTO_INCREMENT`
- `title`: `VARCHAR(255)`
- `description`: `TEXT`
- `category`: `ENUM('ELECTRICAL', 'WATER', 'WIFI', 'PROJECTOR', 'FAN_AC', 'FURNITURE', 'CLEANING', 'CLASSROOM', 'OTHER')`
- `location`: `VARCHAR(255)`
- `priority`: `ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT')`
- `status`: `ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')`
- `student_id`: `BIGINT` Foreign Key referencing `users(id)`
- `technician_id`: `BIGINT` Foreign Key referencing `users(id)` (Nullable)
- `resolution_notes`: `TEXT`
- `created_at`: `DATETIME`
- `updated_at`: `DATETIME`

### 3. `request_updates` Table
Audit ledger tracking every status change, assignment, and action with complete timestamps.
- `id` (Primary Key): `BIGINT AUTO_INCREMENT`
- `request_id`: `BIGINT` Foreign Key referencing `maintenance_requests(id)`
- `updated_by_id`: `BIGINT` Foreign Key referencing `users(id)`
- `old_status`: `VARCHAR(20)`
- `new_status`: `VARCHAR(20)`
- `comment`: `TEXT`
- `created_at`: `DATETIME`
