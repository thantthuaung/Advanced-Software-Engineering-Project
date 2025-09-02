### ✅ Iteration 1: Done and Dusted

**Finished on:** July 4, 2025  
**Total Work Done:** 32 person-days  
**Team Velocity:** Around **3.5 productive days per developer each week**  

---

#### 🗂️ What We’ve Checked Off

- [x] Built and tested all user stories  
- [x] Completed everything in the sprint backlog  
- [x] Created burndown and velocity charts  
- [x] Functional prototype up and running  
- [x] GitHub board and workflows are in place  

---

### 📝 Wrap-up Notes

We hit our targets and got the core features working smoothly.  
No major blockers this sprint, and progress stayed steady throughout.  
Some improvements like polishing the interface and UX tweaks will carry over into Iteration 2.

---

# ✅ Actual Iteration-1 Board: JCU Gym Management System

**Start Date:** June 3, 2025  
**End Date:** July 4, 2025  
**Iteration Duration:** 4 weeks and 4 days

---

## 🔧 Goal

Develop the foundational features of the JCU Gym Management System, including user registration, gym session booking, and admin controls. These features will allow a functional prototype with secure user access and booking flow.

---

## 👥 Team Details

- **Velocity per developer:** **3.5 productive days/week**  
- **Team Size:** 2 developers  
- **Total Estimated Workload:** 30 person-days

---

## 📌 User Stories (Iteration 1)

1. **[User Registration](./user_stories/user_story_01_registration.md)**  
   - **Priority:** High  
   - **Estimate:** 3 days  
   - **Description:** Allow new users to sign up securely with email and password.  
   - **Acceptance Criteria:**  
     - Registration form with name, JCU email, and password  
     - Password validation and hashing  
     - Confirmation on successful signup  
     - Store user data securely in the database  

2. **[Session Booking](./user_stories/user_story_02_session_booking.md)**  
   - **Priority:** High  
   - **Estimate:** 4 days  
   - **Description:** Users can view and book available gym sessions.  
   - **Acceptance Criteria:**  
     - Display available sessions (date, time, slots)  
     - Booking form linked to user  
     - Prevent double-booking  
     - Securely store booking data  

3. **[Admin User Management](./user_stories/user_story_03_admin_management.md)**  
   - **Priority:** High  
   - **Estimate:** 3 days  
   - **Description:** Admin dashboard for managing users.  
   - **Acceptance Criteria:**  
     - View all registered users  
     - Approve or reject users  
     - Secure admin-only access  

4. **[Manage Bookings](./user_stories/user_story_04_manage_bookings.md)**  
   - **Priority:** Medium  
   - **Estimate:** 3 days  
   - **Description:** Let users view and cancel upcoming gym bookings.  
   - **Acceptance Criteria:**  
     - Display all upcoming bookings  
     - Allow cancellation for non-same-day sessions  
     - Update session availability in real-time  
     - Send cancellation confirmation  

---

## 📋 Sprint Backlog Status

### 🟡 In Progress
- Session Booking  
- Manage Bookings  

### ✅ Completed
- User Registration  
- Admin User Management  

---

## 📉 Burndown Chart – Iteration 1

| Week     | Estimated Days Remaining |
|----------|--------------------------|
| Week 4   | 8 days                   |
| Week 3   | 10 days                  |
| Week 2   | 7 days                   |
| Week 1   | 3 days                   |
| Week 0   | 0 days                   |

**Actual Velocity:** Will be calculated at the end of the iteration.

---

## 📦 Key Deliverables

- [x] Fully functional user registration system  
- [x] Admin panel for user control  
- [x] Gym session booking flow  
- [x] Booking cancellation feature  
- [x] Backend APIs + database setup  
- [x] Clean user/admin interface  
- [x] GitHub project board tracking  
- [x] Pull request and issue workflows established  

---

## 🛠️ Technical Stack

- **Frontend:** React.js  
- **Backend:** FastAPI (Python)  
- **Database:** PostgreSQL  
- **Authentication:** JWT  
- **Tracking:** GitHub Issues, Labels, Pull Requests, Projects

---

## 📌 User Stories (Iteration 1)

### 1. User Registration (3 days)
- **Priority:** High  
- **Estimate:** 3 days  
- **Description:** Allow new users to sign up securely with email and password.  
- **Acceptance Criteria:**  
  - Registration form with name, JCU email, and password  
  - Password validation and hashing  
  - Confirmation on successful signup  
  - Store user data securely in the database  

#### Tasks:
- [ ] Design and implement registration form  
- [ ] Implement email and password validation  
- [ ] Implement password hashing for security  
- [ ] Implement confirmation on successful signup  
- [ ] Store user data securely in the database  
- [ ] Test registration flow  

---

### 2. Session Booking (4 days)
- **Priority:** High  
- **Estimate:** 4 days  
- **Description:** Users can view and book available gym sessions.  
- **Acceptance Criteria:**  
  - Display available sessions (date, time, slots)  
  - Booking form linked to user  
  - Prevent double-booking  
  - Securely store booking data  

#### Tasks:
- [ ] Display available sessions on the UI  
- [ ] Implement session booking form linked to user  
- [ ] Implement session availability check to prevent double-booking  
- [ ] Store booking data securely in the database  
- [ ] Test booking functionality  

---

### 3. Admin User Management (3 days)
- **Priority:** High  
- **Estimate:** 3 days  
- **Description:** Admin dashboard for managing users.  
- **Acceptance Criteria:**  
  - View all registered users  
  - Approve or reject users  
  - Secure admin-only access  

#### Tasks:
- [ ] Design and implement admin dashboard  
- [ ] Implement user approval/rejection functionality  
- [ ] Implement secure admin-only access to the dashboard  
- [ ] Test admin dashboard functionality  

---

### 4. Manage Bookings (3 days)
- **Priority:** Medium  
- **Estimate:** 3 days  
- **Description:** Let users view and cancel upcoming gym bookings.  
- **Acceptance Criteria:**  
  - Display all upcoming bookings  
  - Allow cancellation for non-same-day sessions  
  - Update session availability in real-time  
  - Send cancellation confirmation  

#### Tasks:
- [ ] Display user's upcoming bookings on the UI  
- [ ] Implement cancellation functionality for non-same-day sessions  
- [ ] Implement real-time session availability update  
- [ ] Send cancellation confirmation to users  
- [ ] Test booking management and cancellation functionality  
