# Every Peso Counts - Feature Backlog

This document tracks deferred ideas, enhancements, and feature requests for the Every Peso Counts transparency portal. These items are *not* part of the current Minimum Viable Product (MVP) but should be considered for future iterations (Phase 11 and beyond).

## 1. Advanced Notifications
- **SMS Notifications:** Integrate Twilio or Semaphore to send SMS alerts to residents when their feedback is resolved, as an alternative to email.
- **Push Notifications:** Implement PWA (Progressive Web App) push notifications for barangay officials to alert them of urgent announcements on their mobile devices.

## 2. Resident Experience
- **Resident Accounts:** Allow residents to create accounts (using OAuth/Google or Email) so they can track all their submitted feedback in a single personal dashboard without needing to save individual tracking codes.
- **Upvoting System:** Allow residents to "upvote" projects or feedback issues on the public board to help the barangay prioritize community concerns.

## 3. Advanced Administration & Analytics
- **Data Export:** Add functionality for the Secretary or Admin to export Analytics data (Budget reports, Attendance records, Feedback summaries) as CSV or PDF documents for official barangay records.
- **Audit Trails:** Expand the `activity_log` to track every single field change (e.g., tracking the exact old vs. new budget amount) and build a UI for the Admin to view these granular audit logs.
- **Automated Reminders:** Automatically send emails/SMS to Kagawads who have not yet submitted their attendance 24 hours before a scheduled session.

## 4. Enhanced Transparency
- **Financial Breakdown:** Allow uploading of detailed expense receipts or purchase orders attached to specific projects, viewable by the public.
- **Livestream Integration:** Add a field to the `sessions` table to link to a Facebook Live or YouTube stream of the barangay session, displaying it directly on the public portal.
