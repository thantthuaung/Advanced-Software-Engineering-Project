# Advanced-Software-Engineering-Project
# JCU Gym Management System

This project is a web application prototype for managing gym membership, booking, and administration at James Cook University (JCU) Singapore campus.

## Project Overview - Week 1

The system supports two main user roles:

- **Gym Users** (students and staff):  
  - Register online securely  
  - Book gym sessions in advance  
  - View and manage bookings  
    

- **Administrators**:  
  - Manage user registrations  
  - Track gym usage and booking statistics  

## Initial Backlog Ideas

| User Story                                                                 | Priority |
|----------------------------------------------------------------------------|----------|
| **User registration:** Allow new gym users to register securely online.    | High     |
| **Session booking:** Enable users to browse and book available gym sessions in advance. | High     |
| **Manage bookings:** Users can view and cancel their future bookings (except same-day). | Medium   |
| **Admin user management:** Admin can verify and manage registered gym users. | High     |



## User Stories - Week 2

| # | Title                 | Description                                                                                           | Priority | Effort (days) | Iteration   |
|---|-----------------------|---------------------------------------------------------------------------------------------------|----------|---------------|-------------|
| 1 | User Registration     | As a new gym user, I want to register securely online so I can access gym facilities and services. | High     | 3             | Iteration 1 |
| 2 | Session Booking       | As a gym user, I want to browse available gym sessions and book a timeslot in advance.             | High     | 4             | Iteration 1 |
| 3 | Manage Bookings       | As a gym user, I want to view my upcoming bookings and cancel future bookings except for same-day.| Medium   | 3             | Iteration 2 |
| 4 | Admin User Management | As an admin, I want to view and manage registered gym users so I can verify memberships.           | High     | 3             | Iteration 1 |




## User Stories - Week 3
## 🧾 User Story: User Registration

**As a** new gym user  
**I want** to register securely online  
**So that** I can access gym facilities and services  

---

### ✅ Acceptance Criteria
- [ ] Registration form includes Full Name, JCU Email, and Password
- [ ] Password strength validation and hashing
- [ ] Registration confirmation after successful signup
- [ ] User data is stored securely in the system database

---

### 📌 Priority: High  
### ⏱ Estimated Effort: 3 days  
### 🏷 Labels: `frontend`, `backend`, `security`, `iteration1`


## 🧾 User Story: Session Booking

**As a** gym user  
**I want** to browse available gym sessions and book a timeslot in advance  
**So that** I can plan my gym visits ahead of time  

---

### ✅ Acceptance Criteria
- [ ] Display list of sessions with time, date, and available slots
- [ ] Booking form connected to the user session
- [ ] Store booking details in the backend
- [ ] Prevent double-booking the same timeslot

---

### 📌 Priority: High  
### ⏱ Estimated Effort: 4 days  
### 🏷 Labels: `frontend`, `backend`, `calendar`, `iteration1`


## 🧾 User Story: Admin User Management

**As an** admin  
**I want** to view and manage registered gym users  
**So that** I can verify and control access to the gym system  

---

### ✅ Acceptance Criteria
- [ ] Admin dashboard listing all registered users
- [ ] Approve, reject, or deactivate users
- [ ] Admin-only access via secure login
- [ ] Changes to user status reflect in the database

---

### 📌 Priority: High  
### ⏱ Estimated Effort: 3 days  
### 🏷 Labels: `admin`, `backend`, `dashboard`, `iteration1`


## 🧾 User Story: Manage Bookings

**As a** gym user  
**I want** to view my upcoming bookings and cancel future sessions (not on the same day)  
**So that** I can manage my gym attendance more flexibly

---

### ✅ Acceptance Criteria
- [ ] Display a list of all future bookings for the user
- [ ] Cancel option available for bookings not on the same day
- [ ] Successful cancellations update the system and release the slot
- [ ] User receives confirmation of cancellation

---

### 📌 Priority: Medium  
### ⏱ Estimated Effort: 3 days  
### 🏷 Labels: `frontend`, `backend`, `user`, `iteration2`


## 🧾 User Story: Booking Statistics

**As an** admin  
**I want** to see gym usage data and booking trends  
**So that** I can monitor system usage and optimize session availability

---

### ✅ Acceptance Criteria
- [ ] Admin dashboard displays number of bookings per session/date
- [ ] Graphs or charts show usage patterns over time
- [ ] Option to filter by time range or user type
- [ ] Data sourced from real user interactions

---

### 📌 Priority: Medium  
### ⏱ Estimated Effort: 4 days  
### 🏷 Labels: `admin`, `analytics`, `dashboard`, `iteration2`


## 🧾 User Story: Session Reminders

**As a** gym user  
**I want** to receive a reminder before my booked session  
**So that** I don’t miss my workouts

---

### ✅ Acceptance Criteria
- [ ] Reminder sent via email or app notification X hours before session
- [ ] Notification includes session time and location
- [ ] Users can opt in/out of reminders
- [ ] Reminders triggered by background job or scheduler

---

### 📌 Priority: Medium  
### ⏱ Estimated Effort: 3 days  
### 🏷 Labels: `notifications`, `backend`, `UX`, `iteration2`

