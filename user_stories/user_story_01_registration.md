# 🧾 User Story: User Registration

**As a** new gym user  
**I want** to register securely online  
**So that** I can access gym facilities and services

---

## 🔺 Priority: High  
**Reason:** This is a foundational feature required before any other system functionality (e.g., session booking) can be accessed.

---

## 🧮 Estimation: 3 Days  
**Planning Poker Estimates:**
- Developer 1: 3 days (frontend form & validation)  
- Developer 2: 2 days (API and DB logic)  
- Developer 3: 4 days (security implementation)  
**→ Team Consensus:** 3 days

---

## 🔍 Assumptions
- Users must have valid JCU email addresses (`@jcu.edu.au`)
- Password policy follows university security standards
- The base database structure is already in place

---

## 📄 Description

New users (students or staff) should be able to sign up for an account through a secure online form. The system must validate inputs, securely hash passwords, and prevent duplicate accounts. This account will later be used for login and booking sessions.

---

## ✅ Acceptance Criteria

- [ ] Form includes fields: Full Name, JCU Email, Password  
- [ ] Email must follow the format *@jcu.edu.au*  
- [ ] Password must meet complexity requirements (min 8 characters, mixed case, number, special character)  
- [ ] Passwords are securely hashed before storing  
- [ ] Duplicate emails are blocked with clear error messages  
- [ ] Confirmation message displayed after successful registration  
- [ ] All form fields include client-side and server-side validation  
- [ ] User data is stored securely in the database  
- [ ] Responsive feedback and accessibility on form elements

---

## 🧱 Tasks

### 1. Frontend – Registration Form (1 day)
- Design and build the form layout
- Implement client-side validation and live feedback
- Display password strength indicator
- Handle form submission and error/success states

### 2. Backend – API & Logic (1 day)
- Create secure registration endpoint
- Validate input data server-side
- Set up password hashing using bcrypt or similar
- Return appropriate responses for frontend handling

### 3. Database Setup (0.5 day)
- Design `users` table schema (e.g., id, full_name, email, password_hash, created_at)
- Write query for inserting and checking duplicates

### 4. Security Enhancements (0.5 day)
- Implement CSRF protection
- Add basic rate limiting to prevent abuse
- Conduct security checks (e.g., SQL injection protection)

---

## 🎨 UI Design Guidelines

- Clean and minimal design using JCU branding
- Responsive layout for mobile and desktop
- Form field labels, placeholders, and validation hints
- Password strength meter with clear visual indicators
- Clear feedback on success, errors, and in-progress states

*Optional: Include a UI mockup using a prototyping tool like [https://ninjamock.com/](https://ninjamock.com/)*

---

## 📸 Completed Screenshots (To Be Added)

- [ ] Empty form  
- [ ] Form with errors  
- [ ] Password validation in action  
- [ ] Successful registration confirmation  

---

## 📦 Definition of Done

- [ ] All acceptance criteria fulfilled  
- [ ] Unit tests written and passing  
- [ ] Backend integration tested  
- [ ] Code reviewed and approved  
- [ ] Security checks passed  
- [ ] UI/UX signed off by stakeholders  
- [ ] Deployed to staging environment  
