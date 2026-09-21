# Maintenance Request Workflow & State Transitions

## 1. Lifecycle State Machine Diagram

```
                       [ STUDENT ]
                            │
                            │ Submits Request
                            ▼
                    ┌───────────────┐
                    │    PENDING    │
                    └───────┬───────┘
                            │
             ┌──────────────┴──────────────┐
             │ Admin Reviews               │ Admin Rejects
             ▼                             ▼
     ┌───────────────┐             ┌───────────────┐
     │   ASSIGNED    │             │   REJECTED    │
     └───────┬───────┘             └───────────────┘
             │
             │ Technician Starts Work
             ▼
     ┌───────────────┐
     │  IN_PROGRESS  │
     └───────┬───────┘
             │
             │ Technician Completes & Adds Resolution Notes
             ▼
     ┌───────────────┐
     │   RESOLVED    │
     └───────────────┘
```

---

## 2. Step-by-Step Actor Workflows

### 1. Student Workflow
1. **Account Creation**: Student navigates to `/register.html` and creates an account.
2. **Issue Submission**: Student fills out `/create-request.html` with Title, Description, Location, Category, and Initial Priority. Request is saved as `PENDING`.
3. **Tracking**: Student tracks their tickets on `/my-requests.html` or `/request-details.html` to monitor assigned technicians, state updates, and final resolution notes.

### 2. Administrator Workflow
1. **Triage**: Facility Admin logs in and reviews dashboard KPIs and high-priority queues on `/admin-dashboard.html`.
2. **Assessment**: Admin opens `/manage-requests.html`, filters tickets by status/category, and evaluates request legitimacy.
3. **Dispatch or Rejection**:
   - **Legitimate Request**: Admin assigns a specialized technician (e.g. Electrical, Wi-Fi, HVAC). Status becomes `ASSIGNED`.
   - **Invalid / Out of Scope Request**: Admin rejects the ticket with a specific reason. Status becomes `REJECTED`.
4. **Personnel Management**: Admin can add new technician profiles on `/technicians.html`.

### 3. Technician Workflow
1. **Assignment Review**: Technician logs into `/technician-dashboard.html` to view jobs assigned specifically to them.
2. **On-Site Execution**: When arriving at the location, technician clicks **Start Maintenance Work**, transitioning status to `IN_PROGRESS`.
3. **Resolution & Sign-Off**: Once repaired, technician enters detailed technical resolution notes and clicks **Mark as Resolved**, transitioning status to `RESOLVED`.
