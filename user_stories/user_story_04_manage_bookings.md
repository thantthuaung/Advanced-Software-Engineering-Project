# 🧾 User Story: Manage Bookings

**As a** gym user  
**I want** to view my upcoming bookings and cancel future sessions (not on the same day)  
**So that** I can manage my gym attendance more flexibly

---

## 🔸 Priority: Medium  
**Reason:** Improves user autonomy and reduces session no-shows, contributing to better resource management.

---

## 🧮 Estimation: 3 Days  
**Planning Poker Estimates:**  
- Developer 1: 3 days (dashboard interface)  
- Developer 2: 2 days (cancellation logic)  
- Developer 3: 4 days (handling edge cases and feedback)  
**→ Team Consensus:** 3 days

---

## 🔍 Assumptions

- Same-day cancellations are not allowed  
- Cancelled slots become immediately available to others  
- Users get a confirmation upon cancellation  
- Cancellations are logged for future analytics

---

## 📄 Description

Users should be able to view their personal booking list and manage it through a simple interface. They can cancel any upcoming session, except those scheduled for the current day. The system should ensure real-time slot release, user confirmation, and a history view of past changes.

---

## ✅ Acceptance Criteria

- [ ] User dashboard displays all upcoming bookings  
- [ ] Each booking shows session date, time, type, and location  
- [ ] Cancel button is visible only for non-same-day bookings  
- [ ] Attempting to cancel a same-day session shows an error message  
- [ ] Successful cancellations free the slot for others  
- [ ] User receives confirmation (in-app or email)  
- [ ] Cancelled slots are shown as available to other users immediately  
- [ ] Cancellation history is accessible to the user  

---

## 🧱 Tasks

### 1. Booking Dashboard Interface – 1.5 days
- Build UI for booking list  
- Show details: session time, type, location, and status  
- Indicate which bookings are cancellable  

### 2. Cancellation Logic – 1 day
- Enforce same-day restriction  
- Build confirmation modal or popup  
- Apply backend validation and update booking status  

### 3. Backend Cancellation API – 0.5 day
- Build endpoint to process cancellations  
- Update session slot count immediately  
- Log cancellation event with timestamp  

### 4. Feedback & Notifications – 0.5 day
- Show confirmation message on successful cancel  
- Display cancellation history (past actions)  
- Optionally notify users via email or app alerts  

---

## 🎨 UI Design Guidelines

- Simple and clean booking list view  
- Visual cues for active vs. cancelled sessions  
- Confirmation dialogs before finalizing a cancel  
- Same-day bookings marked as locked/non-cancellable  
- Filters for "Upcoming", "Past", and "Cancelled"  
- Responsive for mobile and desktop screens

*Optional: Insert mockup screenshots showing the dashboard and cancel flow*

---

## 📸 Completed Screenshots (To Be Added)

- [ ] Booking dashboard with upcoming sessions  
- [ ] Cancellation modal and success state  
- [ ] Updated session availability display

---

## 📦 Definition of Done

- [ ] All acceptance criteria completed  
- [ ] Cancellations follow business rules  
- [ ] Slot availability updates in real-time  
- [ ] User confirmation and history visible  
- [ ] Unit and integration tests pass  
- [ ] UI/UX reviewed and approved  
- [ ] Code merged and deployed to staging  
