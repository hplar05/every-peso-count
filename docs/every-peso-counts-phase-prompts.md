# "Every Peso Counts" — Phase-by-Phase Development Prompts

How to use this: work through phases **in order**, one at a time. Copy a phase's prompt into your AI coding assistant (e.g. Claude Code) as its own task/session, let it finish and get it working, then move to the next phase. Don't skip ahead — later phases assume earlier ones exist (e.g. Phase 3 assumes Phase 1's schema is already in place).

Each prompt is self-contained: stack, roles, and relevant tables are restated so the assistant doesn't need the whole plan in context. Even so, place the full development plan (every-peso-counts-development-plan-v2.md) in a `docs/` folder at the project root — tell your AI coding assistant it's there for reference so it can check back against it if a prompt's summary leaves anything ambiguous.

Also place the original research/thesis document (research.docx, or a converted research.md/research.pdf) in the same `docs/` folder. It's the source paper this whole plan is built from — the statement of the problem, the proposed system description, the full feature list, an admin login wireframe, the system flowchart (Admin / Secretary / Residents), and the network architecture diagram all live there. Keep it alongside the development plan so the assistant can check the original intent and wireframes directly if anything in a phase prompt is unclear, rather than relying only on the plan's summary of it.

Also place the landing-page reference screenshot in a `design/` folder at the project root (e.g. `design/landing-page-reference.png`). It shows the general layout to follow for the public homepage — a dark header bar with a logo lockup, a centered circular seal, a large "Welcome to [name]" heading, a short tagline, and a row of four colored service cards (icon, title, one-line description). The content and branding get swapped for Every Peso Counts / Barangay Bella Luz — see the note in Phase 0.

---

## Phase 0 — Project Setup

```
Set up a new Next.js (App Router, TypeScript) project called "every-peso-counts" for a
barangay transparency tracking web app. Use Tailwind CSS and shadcn/ui for styling.

1. Initialize the Next.js project with TypeScript, App Router, Tailwind.
2. Add the Supabase JS client (@supabase/supabase-js and @supabase/ssr) and set up
   a lib/supabase client for both server and browser use.
3. Add Resend for transactional email (just install and stub a lib/resend.ts helper —
   no templates yet).
4. Set up .env.local with placeholders for: NEXT_PUBLIC_SUPABASE_URL,
   NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY.
5. Initialize a Git repo with a sensible .gitignore (node_modules, .env.local, .next).
6. Set up the basic folder structure: app/(public)/ for resident-facing pages,
   app/admin/ for the admin/secretary dashboard, lib/ for shared utilities.
7. Create a docs/ folder at the project root and place the development plan
   (every-peso-counts-development-plan-v2.md) inside it. Treat this as the
   reference document for the project's full scope, roles, tables, and
   requirements — check back against it in later phases if a prompt's
   instructions are ever ambiguous.
8. Also place the original research/thesis document (research.docx or a
   converted research.md/research.pdf) in the same docs/ folder. It contains
   the statement of the problem, the proposed system description, the full
   feature list, an admin login wireframe, the system flowchart (Admin /
   Secretary / Residents), and the network architecture diagram. Treat it as
   the source-of-truth academic context behind the development plan.
9. Create a design/ folder at the project root and place the landing-page
   reference screenshot inside it (design/landing-page-reference.png). This
   image shows the layout to follow for the public homepage — a dark header
   bar with a logo on the left and a "last visit" timestamp on the right, a
   centered circular seal/logo, a large "Welcome to [name]" heading with the
   name in an accent color, a short tagline below it, and a row of four
   colored cards (icon, bold title, one-line description) linking to the
   site's main sections. Do NOT copy its branding, text, or specific colors —
   only its structure and proportions. Adapt it for this project:
   - Header: "Every Peso Counts" (or a short wordmark) on the left, "Last
     updated on [date/time]" on the right (this project has no per-visitor
     login on the homepage, so this is a data-freshness timestamp, not a
     personal "last visit").
   - Centered seal/logo: use a simple placeholder circular emblem for now
     (e.g. a barangay/community icon in a ring, with "Barangay Bella Luz"
     text around it) — swap in the real barangay seal image later when
     available.
   - Heading: "Welcome to" / "Barangay Bella Luz" (name in the accent color),
     with a tagline like "Every peso counts — see how your barangay's funds
     and projects are managed."
   - Four cards, replacing the reference's four (Application / Student
     Portal / Faculty Portal / Other Services) with this system's four public
     entry points: Admin Sign In, Secretary Login, Resident View, and Feedback —
     each with a short one-line description and its own status color from the
     Phase 0 palette (e.g. green/gold/blue/teal, one per card, flat fill, no
     heavy gradients — subtle single-tone decoration is fine, but keep it
     restrained per the design guidelines below).
10. Establish a design system baseline so the app is strictly professional and does not look like an AI-generated template:
   - Typography: Pick one clean sans-serif font (e.g. Inter) and use only two weights (regular, medium) throughout — no decorative or mixed fonts.
   - Avoid generic AI hallmarks: Strictly prohibit emojis anywhere in the UI. Do not overuse dashes (-) or hyphens for decoration or spacing. Use proper padding and margins instead.
   - Professional Links: No underlined text, including links. Style links with color and a hover state instead of text-decoration: underline.
   - Restrained Colors & Styling: Flat, solid colors only — no gradients or heavy drop shadows. Use the official Barangay Theme:
     - Primary: Deep Blue (#1E3A5F) for Header/Navbar
     - Secondary: Government Blue (#2563EB) for main buttons/links
     - Accent: Warm Gold (#F4B942) for highlights or important announcements
     - Success/Community: Green (#2E7D32) for services or completed projects
     - Background: Light Gray (#F5F7FA) for website background
     - Text: Dark Navy (#172033) for primary text
     - Cards/Containers: White (#FFFFFF)
   - UX & Layout: Layouts must be information-dense and accessible (e.g., proper contrast, keyboard support, semantic HTML). Prioritize tables, clear data cards, and logical hierarchy fitting a government portal, rather than a generic marketing landing page.

Don't build any features yet — this phase is just a clean, working scaffold that
runs with `npm run dev` and is ready to connect to Supabase.
```

---

## Phase 1 — Database & Auth Foundation

```
Continuing the "every-peso-counts" Next.js + Supabase project from Phase 0.

There are exactly four user roles: Admin, Secretary, Kagawad, and Residents (residents are
public/unauthenticated — no login for them at all).

1. Write the Supabase SQL migration for these tables:
   - officials (id, name, role: 'admin' | 'secretary' | 'kagawad',
     position, status: 'pending' | 'approved' | 'rejected' default 'approved',
     qr_code, rejection_reason, created_at)
     Note: 'kagawad' replaces 'council_member' and has a full portal account.
     Both 'secretary' and 'kagawad' roles start as 'pending'; 'admin' 
     defaults to 'approved'.
   - projects (id, name, description, status, start_date, target_date,
     budget_allocated, budget_utilized, created_at)
   - milestones (id, project_id FK, title, target_date, status)
   - budget_entries (id, project_id FK, source, amount_allocated, amount_spent,
     remaining_balance, purpose, date)
   - sessions (id, session_date, agenda, minutes_file_url)
   - attendance (id, session_id FK, official_id FK, status: 'present' | 'absent' |
     'excused', scanned_at)
   - feedback (id, resident_name nullable, message, status: 'pending' | 'in_review'
     | 'resolved', response, handled_by FK->officials, tracking_code, created_at)
   - notifications (id, type, message, sent_at, recipient_scope)

2. Set up Supabase Row Level Security:
   - Admin and Secretary (authenticated via Supabase Auth, matched against their
     officials row) get read/write on all tables.
   - Anonymous/public users get read-only on projects, milestones, budget_entries,
     sessions, attendance, and resolved feedback only — never on officials or
     pending/in_review feedback.

3. Implement separate login pages for each role (/login/admin, /login/secretary, /login/kagawad)
   using Supabase Auth (email/password). After login, look up the user's row in officials by email/id:
   - If role is 'secretary' or 'kagawad' and status is 'pending', block access and show a
     "waiting for approval" screen instead of the dashboard.
   - If status is 'rejected', block access and show the rejection reason.
   - Otherwise, route to the dashboard.

4. Build Next.js middleware protecting /admin/* routes — unauthenticated or
   unapproved users get redirected to a login page. Public routes stay open.

Focus only on schema, RLS, and auth gating in this phase — no dashboard UI yet
beyond a minimal login page and a placeholder "pending approval" screen.
```

---

## Phase 2 — Admin & Data Management

```
Continuing "every-peso-counts". Phase 1's schema, RLS, and auth are in place.

1. Build the admin dashboard shell: a sidebar/nav with sections for Projects,
   Budget, Sessions & Attendance, Feedback, Reports, and (Admin-only) Analytics
   and Pending Approvals. Secretary sees the same shell minus Analytics and
   Pending Approvals.
2. Build CRUD for Secretary and Kagawad accounts. (Admin can manage both; Secretary can manage Kagawads). Allow creating an account (inserts an officials row with role='secretary' or 'kagawad', status='pending').
3. Add a "Pending Approvals" tab. Admin sees all pending accounts; Secretary sees only pending Kagawad accounts. Approve sets status='approved' (use Supabase Realtime so if the login screen is open, it updates without a refresh). Reject sets status='rejected' and requires a short reason text field, stored in rejection_reason.
4. Add an activity_log table (id, official_id FK, action, target_table,
   target_id, created_at) and write a log entry whenever an admin/secretary
   creates, edits, approves, or rejects anything in this phase.

Keep the UI functional but simple — shadcn/ui components, no polish pass yet.
Follow the Phase 0 design guidelines: no emoji, no underlined text, flat
status colors only.
```

---

## Phase 3 — Project & Milestone Management

```
Continuing "every-peso-counts". Admin/Secretary dashboard shell exists from Phase 2.

1. Build Admin/Secretary CRUD for projects: name, description, status (Planning /
   Ongoing / Completed), start_date, target_date, budget_allocated, budget_utilized.
2. Build milestone tracking nested under a project: add/edit/delete milestones
   (title, target_date, status), shown on the project's detail view.
3. Build the public-facing pages (app/(public)/):
   - A homepage (app/(public)/page.tsx) following the layout in
     design/landing-page-reference.png (see Phase 0 for the adapted spec):
     header bar, centered seal placeholder, "Welcome to Barangay Bella Luz"
     heading with tagline, and four colored cards linking to Admin Sign In,
     Secretary Login, Resident View, and Feedback.
   - A project list page showing name, status badge, and a progress bar
     (based on completed milestones or budget_utilized/budget_allocated).
   - A project detail page showing description, dates, milestones, and budget
     summary (read-only, no login).
4. Log project/milestone create/edit/delete actions to activity_log.

Use Supabase Realtime (optional) so the public project list updates live when
an admin publishes changes, but a working non-realtime version is fine as a
first pass. Follow the Phase 0 design guidelines for the public pages: no
emoji, no underlined text, flat status colors, information-dense layout
rather than a marketing-style page.
```

---

## Phase 4 — Budget & Fund Utilization Management

```
Continuing "every-peso-counts". Projects module exists from Phase 3.

1. Build a budget entry form for Admin/Secretary: project (select), source,
   amount_allocated, amount_spent, purpose, date. remaining_balance is
   auto-computed (amount_allocated - amount_spent) — never manually entered.
2. Build a budget dashboard (Recharts) showing allocated vs. spent vs. remaining,
   both per-project and totaled across all projects, plus a spend-over-time
   trend chart.
3. Build a public budget transparency page: per-project budget breakdown and
   the same allocated/spent/remaining visualization, read-only, no login.
4. Log budget entry create/edit/delete to activity_log.

Use React Hook Form + Zod for the budget entry form's validation (amounts must
be non-negative numbers, amount_spent shouldn't exceed amount_allocated —
warn but don't hard-block, since real overspending can happen and needs to be
visible, not hidden). Follow the Phase 0 design guidelines for the public
budget page: no emoji, no underlined text, one restrained color per status
(don't rainbow-color the chart).
```

---

## Phase 5 — Session Attendance & Minutes Management

```
Continuing "every-peso-counts". Officials table and dashboard exist from
Phases 1–2.

1. Build a session record form for Admin/Secretary: session_date, agenda text.
2. Build a Minutes of Meeting file upload to Supabase Storage, attached to a
   session (store the resulting URL in sessions.minutes_file_url).
3. Build QR code attendance:
   - Each row in officials (admin, secretary, and any council_member entries)
     gets a unique QR code generated once when the record is created (use the
     `qrcode` npm package), tied to that official's id. Council members have
     no login account — this QR is their only "credential," used purely for
     attendance, not access.
   - Build an "Attendance Scan" page (Secretary-facing) for a given session
     that uses the device camera (`html5-qrcode` or similar) to scan an
     official's QR code. On a successful scan, look up the official, auto-fill
     name/role, and insert an attendance row with status='present' and
     scanned_at=now().
   - Allow manually marking an official absent/excused for officials without
     their QR on hand.
4. Build a public attendance history page per official: list of sessions and
   their attendance status, read-only, no login.
5. Log session/minutes/attendance actions to activity_log.

Follow the Phase 0 design guidelines for the scan page and public attendance
page: no emoji, no underlined text, flat status colors for present/absent/
excused.
```

---

## Phase 6 — Notifications & Reporting

```
Continuing "every-peso-counts". Projects, budget, and sessions modules exist
from Phases 3–5.

1. Wire up Resend: send an email when a project is updated, a new session is
   scheduled, or an announcement is posted. Recipients come from a simple
   notifications table (recipient_scope: 'all' | 'officials' | 'specific').
2. Build a report generator: Admin/Secretary picks a date range and gets a
   summary (projects touched, budget totals, attendance) for that range,
   exportable as a PDF (use @react-pdf/renderer or a server-side Puppeteer
   route — pick whichever is simpler to wire up in this stack).
3. Optional: add a Vercel Cron job or Supabase scheduled function that emails
   a reminder a day before an upcoming session.

Keep email templates plain and functional — subject line + a few lines of
body text, not a fully designed HTML template, unless you want to invest
extra time here.
```

---

## Phase 7 — Citizens Feedback & Inquiry Management

```
Continuing "every-peso-counts". Officials table and dashboard exist.

1. Build a public feedback/inquiry submission form (no login required):
   - Fields: message (required), resident_name (optional — the resident can
     leave this blank to submit anonymously).
   - Before saving, run the message through content validation:
     a. Basic validity check: reject empty, whitespace-only, or very short
        (e.g. under ~5 characters) messages.
     b. Profanity/bad-words check using a wordlist package (`bad-words` or
        `leo-profanity`). Keep the wordlist in an editable config so it can
        be extended later without a code change.
     Run this validation both client-side (instant feedback) and again
     server-side in the API route/Server Action (never trust client-only
     validation). If validation fails, do NOT insert the row — show a toast:
     "Your message contains inappropriate content and wasn't submitted.
     Please revise and try again." for profanity, or "Please enter a valid
     message." for the basic check.
   - On successful submission, generate and show a tracking_code (short random
     string), and email it via Resend only if resident_name/email was
     provided — if fully anonymous, just show it on-screen.
2. Build a Kagawad (and Admin/Secretary) feedback inbox: list all feedback, view details,
   write a response, and set status (pending / in_review / resolved). Record
   handled_by as the responding official's id. This is the primary duty of the Kagawad.
3. Build a public "Check Status" page: resident enters their tracking_code and
   sees status + response if any.
4. Build a public feedback board page: lists all feedback with status =
   'resolved' alongside the Kagawad/Admin/Secretary response. Never display
   resident_name on this board even if it was provided — use it only
   internally for the optional Resend email. Decide and apply a consistent
   reply attribution (e.g. "— Barangay Kagawad" or "— Barangay Secretary").
5. Send a Resend notification to the resident when their feedback is resolved,
   only if they provided contact info.

Keep all feedback UI (form, board, check-status page) consistent with the
design guidelines from Phase 0: no emoji in labels or toasts, no underlined
text, flat status colors, plain direct copy for empty/error states (e.g.
"No feedback yet." rather than an exclamation-heavy message).
```

---

## Phase 8 — Integration & Testing

```
Continuing "every-peso-counts". All modules from Phases 1–7 exist.

1. Write end-to-end tests (Playwright or Cypress — pick one) covering each
   module's core flow: project CRUD, budget entry, session + QR attendance
   scan, feedback submission + validation + response + public board visibility.
2. Write access-control tests confirming:
   - A resident (unauthenticated) cannot reach any /admin/* route.
   - A pending Secretary account cannot access the dashboard.
   - RLS policies actually block anonymous writes to officials, projects,
     budget_entries, etc., and block anonymous reads of officials and
     non-resolved feedback.
3. Cross-device/responsive testing: verify all public-facing pages (project
   list, budget page, attendance history, feedback board, check-status page)
   work on mobile viewport widths, since residents will mostly use phones.
4. Fix any bugs found and document known limitations.
```

---

## Phase 9 — Deployment

```
Continuing "every-peso-counts". Testing from Phase 8 is complete.

1. Set up the production Supabase project (separate from dev) and run all
   migrations against it.
2. Deploy the Next.js app to Vercel, connected to the production Supabase
   project via environment variables. Verify SSL/domain setup.
3. Provision real Admin and Secretary accounts for barangay staff (Admin
   account created directly with status='approved'; any Secretary accounts
   created afterward go through the normal pending → approved flow).
4. Smoke-test the production deployment end-to-end before handing it over.
```

---

## Phase 10 — Evaluation & Maintenance (ongoing)

```
"every-peso-counts" is deployed to production (Phase 9 complete).

1. Set up basic monitoring: Supabase usage/quota alerts, Resend deliverability
   checks (bounce/complaint rates).
2. Prepare a short feedback form or checklist for the Barangay Captain,
   Secretary, and a few resident testers to record usability issues.
3. Create a backlog document listing deferred ideas (SMS notifications via
   Twilio/Semaphore, resident login accounts for tracking their own requests,
   push notifications) for future iterations — don't build these now.

This phase is ongoing maintenance, not a one-time build — treat it as a
recurring checklist rather than a sprint.
```