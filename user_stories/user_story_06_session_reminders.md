# User Story: Session Reminders

**As a** gym user  
**I want** to receive a reminder before my booked session  
**So that** I don't miss my workouts

---

## Priority: Medium  
**Rationale:** Improves user experience and reduces no-shows, maximizing gym utilization.

## Estimation: 3 days  
**Planning poker estimates:**
* Developer 1: 3 days (notification system complexity)
* Developer 2: 2 days (basic email reminders)
* Developer 3: 4 days (including scheduling and preferences)
* **Consensus:** 3 days

## Assumptions:
- Email is the primary notification method (SMS optional for future)
- Users can opt in/out of reminders
- Reminders are sent X hours before session (configurable)
- Background job scheduler is available for automated sending

## Description:
Implement an automated reminder system that notifies users before their scheduled gym sessions. The system should allow users to customize their notification preferences and ensure timely delivery of reminders to reduce no-shows and improve user engagement.

## Acceptance Criteria:
- [ ] Reminder sent via email X hours before session (default: 2 hours)
- [ ] Notification includes session time, date, and location details
- [ ] Users can opt in/out of reminders in their profile settings
- [ ] Users can customize reminder timing (1, 2, 4, or 24 hours before)
- [ ] Reminders triggered by background job or scheduler
- [ ] No reminders sent for cancelled sessions
- [ ] Email template follows JCU branding guidelines
- [ ] Delivery confirmation tracking for sent reminders

## Tasks:

1. **Email Service Integration** - 1 day
   - Set up email service provider (SendGrid/AWS SES)
   - Create email templates for reminders
   - Implement email sending functionality
   
2. **Reminder Scheduling System** - 1 day
   - Create background job scheduler
   - Implement reminder timing logic
   - Set up automated reminder triggers
   
3. **User Preference Management** - 0.5 days
   - Add reminder settings to user profile
   - Create preference update interface
   - Implement opt-in/out functionality
   
4. **Monitoring & Error Handling** - 0.5 days
   - Add delivery tracking and logging
   - Implement retry logic for failed sends
   - Create admin monitoring dashboard

# UI Design:
Reminder system should include:
- User-friendly notification preference settings
- Clear email template with session details
- Toggle switches for enabling/disabling reminders
- Dropdown for reminder timing options
- Confirmation messages for preference updates
- Mobile-responsive settings interface

*Note: Insert mockup design screenshot showing user preference settings and email template*

# Completed:
*Insert screenshots of completed implementation*
*Show preference settings, sample email reminder, admin monitoring*

## Definition of Done:
- [ ] All acceptance criteria met
- [ ] Email reminders sending reliably
- [ ] User preferences working correctly
- [ ] Background scheduler functioning properly
- [ ] Error handling and retry logic implemented
- [ ] Unit and integration tests passing
- [ ] Email deliverability tested
- [ ] Code reviewed by team
- [ ] Feature approved by stakeholders 