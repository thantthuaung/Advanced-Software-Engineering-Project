# 🧾 User Story: Admin User Management

**As an** admin  
**I want** to view and manage registered gym users  
**So that** I can verify and control access to the gym system

---

## 🔺 Priority: High  
**Reason:** Critical for access control, ensuring only valid users are allowed to book sessions and use facilities.

---

## 🧮 Estimation: 3 Days  
**Planning Poker Estimates:**  
- Developer 1: 3 days (dashboard and interface complexity)  
- Developer 2: 2 days (CRUD and DB logic)  
- Developer 3: 4 days (including security and audit trail)  
**→ Team Consensus:** 3 days

---

## 🔍 Assumptions

- Admin accounts are created manually by system administrators  
- Admin interface is separate from regular user view  
- Membership validation is handled based on JCU affiliation  
- System must maintain a log of all admin actions (audit trail)

---

## 📄 Description

Admins should have access to a dashboard where they can view, verify, and manage gym user accounts. This includes the ability to approve, reject, or deactivate users. The dashboard must be secure, support filtering, and keep a history of actions performed by admins.

---

## ✅ Acceptance Criteria

- [ ] Admin-only dashboard listing all users  
- [ ] Display user info: full name, email, registration date, and status  
- [ ] Approve, reject, or deactivate accounts with confirmation prompts  
- [ ] Secure login restricted to admin roles  
- [ ] Changes are reflected immediately in the backend  
- [ ] Search and filter options for user list  
- [ ] Pagination for managing large lists  
- [ ] Audit trail logs every admin action  
- [ ] Bulk user actions (e.g., approve/reject multiple users)

---

## 🧱 Tasks

### 1. Admin Auth & Security – 1 day
- Create separate admin login view  
- Implement role-based access control (RBAC)  
- Secure admin sessions and logout logic  

### 2. User Dashboard Interface – 1.5 days
- Build UI for viewing user list with pagination  
- Add search, sort, and filter capabilities  
- Display relevant user info in a table format  

### 3. User Management Actions – 0.5 day
- Approve, reject, deactivate individual users  
- Include confirmation modals for critical actions  
- Implement bulk actions for selected users  

### 4. Audit Trail Logging – 0.5 day
- Log admin actions (timestamp, user affected, action type)  
- Display logs in a dedicated audit section  
- Track changes in user status over time  

---

## 🎨 UI Design Guidelines

- Clean, professional dashboard interface  
- Tabular user view with sort/filter/search options  
- Clear indicators for user status (e.g., Approved, Pending, Deactivated)  
- Action buttons with tooltips and modals  
- Overview panel with key metrics (total users, pending requests)  
- Mobile and desktop responsive design

*Optional: Add screenshots or mockups showing admin dashboard layout*

---

## 📸 Completed Screenshots (To Be Added)

- [ ] Admin dashboard overview  
- [ ] User detail view and action buttons  
- [ ] Confirmation modal and status change flow  
- [ ] Audit log view

---

## 📦 Definition of Done

- [ ] All acceptance criteria fulfilled  
- [ ] Secure admin access working as intended  
- [ ] User status changes persist and display correctly  
- [ ] Audit logs created for all admin actions  
- [ ] Unit and integration tests passing  
- [ ] Code reviewed and approved  
- [ ] Admin UX approved by stakeholders  
- [ ] Deployed to staging environment  
