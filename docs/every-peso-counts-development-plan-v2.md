# "Every Peso Counts" — Development Plan (v2)
### Web-Based Transparency Tracking System for Barangay Bella Luz, San Mateo

**Stack:** Next.js (frontend + API routes) · Supabase (Postgres DB, Auth, Storage, Realtime) · Resend (email notifications) · Vercel (hosting)

**User roles:** Admin, Secretary, Kagawad (Council Member), Residents (public, no login) — four roles. Kagawads have their own portal primarily to respond to citizen feedback.

---

## 1. Recommended Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Framework | **Next.js (App Router)** | One codebase for public resident pages + admin dashboard, built-in API routes/Server Actions, easy deploy to Vercel |
| Database | **Supabase (Postgres)** | Replaces MySQL; gives you a hosted DB, auto-generated REST/JS client, and Row Level Security for role-based access |
| Auth | **Supabase Auth** | Replaces the custom PHP login system for Admin and Secretary; residents stay unauthenticated (public read) |
| File storage | **Supabase Storage** | For uploaded Minutes of Meeting files, project photos, budget attachments |
| Notifications | **Resend** | Transactional/notification emails — project updates, feedback responses, session reminders |
| Realtime updates | **Supabase Realtime** | Optional: live-update the public dashboard when admin publishes a new project/budget entry, no refresh needed |
| Styling/UI | **Tailwind CSS + shadcn/ui** | Fast, clean admin dashboard and public pages without custom CSS from scratch |
| Forms & validation | **React Hook Form + Zod** | Budget entry, project, and feedback forms with validated input |
| Charts | **Recharts** | Budget allocated vs. spent vs. remaining, attendance stats |
| PDF/Report export | **@react-pdf/renderer** or server-generated PDF via Puppeteer | For the "generate summarized reports" feature |
| Hosting | **Vercel** (app) + **Supabase** (backend) | Free-tier friendly for a thesis/capstone deployment |
| Optional extras | **Twilio/Semaphore SMS**, **OneSignal push**, **Vercel Cron** | SMS alerts for residents without email; scheduled reminder jobs for upcoming sessions |

This stack maps directly onto your four user roles (Admin, Secretary, Kagawad, Residents) and six admin subsystems — it just swaps PHP/MySQL/XAMPP for a modern hosted equivalent, so your Conceptual Framework, DFD, and Network Architecture diagrams don't need to change, only the implementation layer.

### Design Guidelines

The public-facing site and dashboards should read as a professional, custom-built government transparency portal — not as a generic AI-generated template. Apply these rules across every screen:

- **No emoji anywhere in the UI**: Ensure zero emojis in headings, buttons, status labels, toasts, or emails. Instead, use a professional, minimal icon set (e.g., Tabler or Lucide icons) strictly sized and colored to match the surrounding text.
- **Avoid overuse of dashes/hyphens**: Do not overuse dashes (`-`) or hyphens as decorative elements, separators, or bullet points in the actual UI. Use clean margins, padding, and subtle borders for separation instead.
- **No underlined text**: Underlines on links are a strong "default template" tell. Style links with color and a subtle hover state instead of `text-decoration: underline`.
- **Avoid generic AI-template patterns**: Strictly prohibit big centered hero sections with gradient blob backgrounds, overuse of rounded-pill shapes, purple-to-blue gradient buttons, and stock "3-icon feature grid" layouts. Prioritize a professional, scalable design system: clean layouts, logical content grouping, predictable alignment, and information-dense structures (e.g., robust data tables, cards with real data, clear hierarchy) fitting for a government portal.
- **Flat, restrained color use**: Stick to solid fills only. Avoid gradients and heavy drop shadows (use a subtle card border or minimal shadow). Use the official Barangay Theme:
  - **Primary**: Deep Blue (`#1E3A5F`) for Header/Navbar
  - **Secondary**: Government Blue (`#2563EB`) for main buttons/links
  - **Accent**: Warm Gold (`#F4B942`) for highlights or important announcements
  - **Success/Community**: Green (`#2E7D32`) for services or completed projects
  - **Background**: Light Gray (`#F5F7FA`) for website background
  - **Text**: Dark Navy (`#172033`) for primary text
  - **Cards/Containers**: White (`#FFFFFF`)
- **Typography**: pick one clean sans-serif (e.g. Inter, or a Google Font that isn't the obvious default) and stick to two weights (regular/medium) — avoid mixing multiple decorative fonts, which is another common AI-generated tell.
- **Real content over placeholder-feeling copy**: Labels, form fields, and empty states must use plain, direct, professional language (e.g., "No pending approvals" instead of "Nothing here yet!"). Use sentence case throughout, ensure clear form validation states, and avoid exclamation marks.
- **UX & Accessibility Focus**: Ensure semantic HTML, proper keyboard navigation, responsive design (mobile-first), and progressive disclosure to avoid clutter without relying on gimmicky AI animations. Keep animations minimal (fade/scale/slide) and purposeful.

These rules apply to every phase below that touches UI — Phase 0 (design system setup), Phase 2 (admin shell), Phase 3 (public project pages), Phase 4 (budget dashboard), Phase 5 (attendance pages), and Phase 7 (feedback form and board).

---

## 2. Development Phases

### Phase 0 — Project Setup (Week 1)
- Initialize Next.js project (App Router, TypeScript, Tailwind, shadcn/ui)
- Create Supabase project; set up Postgres schema, Auth, Storage buckets
- Set up Resend account + domain verification for outgoing email
- Set up Git repo + Vercel deployment pipeline (auto-deploy on push)
- Define environment variables (Supabase URL/keys, Resend API key)

### Phase 1 — Database & Auth Foundation (Weeks 2–3)
- Design tables: `officials`, `projects`, `milestones`, `budgets`, `sessions`, `attendance`, `feedback`, `notifications`
- Set up Supabase Row Level Security (RLS): Admin/Secretary = write access, Residents/public = read-only
- Implement unified Official Login (Admin, Secretary, Kagawad) via Supabase Auth (email/password)
- Build role-based route protection (middleware) for `/admin/*` vs public routes

### Phase 2 — Admin & Data Management (Weeks 3–4)
- Admin dashboard shell (sidebar/nav for the 6 subsystems)
- CRUD for Secretary and Kagawad accounts (Admin only for Secretary; Admin or Secretary for Kagawad)
- Activity logging table (who changed what, when) for accountability

### Phase 3 — Project & Milestone Management (Weeks 4–5)
- Add/edit/delete projects (name, description, status, dates, budget allocated/utilized)
- Milestone tracking per project
- Public project list + detail page (status, progress bar)
- A homepage (app/(public)/page.tsx) following the layout in design/landing-page-reference.png: header bar, centered seal placeholder, "Welcome to Barangay Bella Luz" heading with tagline, and four colored cards linking to Admin Sign In, Secretary Login, Resident View, and Feedback.

### Phase 4 — Budget & Fund Utilization Management (Weeks 5–6)
- Budget entry form (source, amount allocated, spent, remaining, purpose)
- Auto-computed remaining balance (no manual cross-checking)
- Budget dashboard with Recharts (allocated vs. spent per project/category)
- Public budget transparency page

### Phase 5 — Session Attendance & Minutes Management (Weeks 6–7)
- Session record form (date, agenda, council member present/absent/excused)
- QR code attendance scanning (see 4.2 below)
- Minutes of Meeting file upload (Supabase Storage)
- Public attendance history page per official

### Phase 6 — Notifications & Reporting (Weeks 7–8)
- Resend integration: email residents/officials on project updates, upcoming sessions, announcements
- Report generator (date range → project/budget/attendance summary, exportable as PDF)
- Optional: Supabase scheduled function or Vercel Cron for automatic reminders

### Phase 7 — Citizens Feedback & Inquiry Management (Weeks 8–9)
- Public feedback/inquiry submission form (no login required); **name field is optional** so residents can submit anonymously if they prefer
- **Content validation on submit**: check the message against a profanity/bad-words filter (e.g. `bad-words` or `leo-profanity` npm package, or a Supabase Edge Function running a wordlist check) before it's saved — if it fails, block the submission and show a toast like "Your message contains inappropriate content and wasn't submitted. Please revise and try again."
- Kagawad inbox to view, respond, and mark status (pending/in review/resolved) - this is the Kagawad's primary duty.
- **Public feedback board**: a page listing all feedback/questions alongside the Kagawad, Admin, or Secretary reply, so any resident can browse what's been asked and answered — not just look up their own submission
- Email notification to resident when their inquiry gets a response (Resend) — only sent if the resident provided contact info; anonymous submitters use the tracking code or the public board instead

### Phase 8 — Integration & Testing (Weeks 9–10)
- End-to-end testing per module
- Access-control testing (resident can't reach admin routes; RLS policies verified)
- Cross-device testing (desktop, mobile — since residents will mostly use phones)

### Phase 9 — Deployment (Week 10)
- Final deploy to Vercel + Supabase production project
- Domain setup, SSL (handled automatically by Vercel)
- Admin/Secretary account provisioning for the actual barangay staff

### Phase 10 — Evaluation & Maintenance (Ongoing)
- Gather feedback from Barangay Captain, secretary, and resident testers
- Monitor Supabase usage/limits, Resend email deliverability
- Backlog for future improvements (e.g., SMS notifications, resident accounts for tracking their own requests)

---

## 3. Suggested Database Tables (starting point)

- `officials` — id, name, role (admin/secretary/kagawad), position, status (pending/approved/rejected)
  - *Note: `kagawad` replaces `council_member` and gets a full portal account for feedback management.*
- `projects` — id, name, description, status, start_date, target_date, budget_allocated, budget_utilized
- `milestones` — id, project_id, title, target_date, status
- `budget_entries` — id, project_id, source, amount_allocated, amount_spent, remaining_balance, purpose, date
- `sessions` — id, session_date, agenda, minutes_file_url
- `attendance` — id, session_id, official_id, status (present/absent/excused), scanned_at
- `feedback` — id, resident_name (optional), message, status, response, handled_by, created_at
- `notifications` — id, type, message, sent_at, recipient_scope (all/officials/specific)

---

## 4. New Requirements — Analysis & Additions

### 4.1 Approvals (Admin & Secretary)
- Secretary registers (or Admin creates the account) → account status = `pending`. Must be approved by Admin.
- Kagawad registers → account status = `pending`. Must be approved by Admin or Secretary.
- Pending users **cannot** sign in — Supabase Auth login succeeds, but your app checks `status` on the `officials` table and blocks access with a "waiting for approval" screen.
- Admin dashboard gets a **Pending Approvals** tab listing secretary and kagawad accounts awaiting approval. Secretary dashboard gets a Pending Approvals tab for kagawad accounts only.
- "Instant" = as soon as approved, `status` flips to `approved` in Supabase — with **Supabase Realtime**, the login screen can auto-update.
- Rejected registrations should log a reason (simple text field) for accountability.

### 4.2 QR Code Attendance (Officials — Data Only, No Portal)
- Each official tracked for attendance (Admin, Secretary, and any council members) gets a **unique QR code** tied to their record in `officials` (generated once, e.g. on record creation — can use a library like `qrcode` npm package)
- Council members do **not** need a login account for this — their `officials` row exists purely to hold their name/role/QR code for attendance purposes
- Secretary opens an **"Attendance Scan"** page during a session → uses device camera (`html5-qrcode` or similar) to scan each official's QR
- On scan: system looks up the official by QR → auto-fills **Name, Role, Date/Time** → marks them Present for that session instantly (no manual typing)
- Secretary can still manually mark Absent/Excused for officials who don't have their QR on hand
- All scans are timestamped and tied to the specific session date — this becomes your `attendance` table entries automatically instead of a manual form

### 4.3 Data Analytics (Admin Dashboard)
Admin-only (not visible to Secretary or public). Suggested analytics widgets:
- **Budget analytics**: total allocated vs. spent vs. remaining across all projects, spend trend over time, top-spending projects
- **Project analytics**: count by status (Planning/Ongoing/Completed), average completion time, overdue milestones
- **Attendance analytics**: attendance rate per official over time, most/least attended sessions
- **Feedback analytics**: number of inquiries received vs. resolved, average response time
- Built with Recharts, pulling aggregated queries from Supabase (views or RPC functions for the heavier aggregations)

### 4.4 Feedback Management — Kagawad Duty
- The primary duty of the Kagawad role is to manage, review, and reply to citizen feedback.
- Admin, Secretary, and Kagawad can all view and respond to inquiries, ensuring transparency.
- `handled_by` field on `feedback` tracks which official responded — useful for accountability.
- Since replies now show up on the **public feedback board** (see 4.5), replies go out under the staff member's name/role (e.g. "— Barangay Kagawad").

### 4.5 Resident Request/Feedback Status Visibility
Your question: *can residents see if their request/feedback has been approved or acted on?*
- The feedback form's **name field stays optional** — a resident can leave it blank and submit anonymously, or fill it in if they want to be identified/contacted directly. Either way the tracking code below is what lets them check status, so anonymity doesn't cost them visibility.
- **Public feedback board**: beyond checking their own request, residents can now browse a public page listing all submitted feedback/questions together with the Admin or Secretary reply — turning this into a public Q&A rather than a private inbox only the submitter can see
  - Only feedback that's been responded to (status = resolved, or whatever status you use to mean "answered") needs to show up here — pending/unanswered items can stay hidden until there's a reply
  - Since `resident_name` is optional and the board is public, decide whether a resident's name displays if they did provide one, or whether the board always shows entries as anonymous regardless — the safer default for a public board is to never display `resident_name` even if it was collected, and use it internally (for Resend follow-up emails) only
  - The board pairs naturally with the tracking-code page: tracking code → find your own specific request quickly; board → browse everything
- Two options depending on whether residents get accounts:
  - **No accounts (current design — public, no login):** give each submitted feedback/request a **tracking code** (e.g. shown after submit, or emailed via Resend) that the resident can enter on a public "Check Status" page to see Pending / In Review / Resolved + any admin response
  - **With resident accounts (bigger change):** residents log in and see a personal dashboard of all their submitted requests and statuses — more convenient, but adds resident auth, which wasn't in your original scope
- Recommendation: start with the **tracking-code approach** — it keeps residents login-free (matching your original "no account needed" design) while still giving them visibility into their request status

### 4.6 Feedback Content Validation
- Before a feedback submission is saved, run the message through a validation check:
  - **Profanity/bad-words check** — reject messages containing flagged words (a wordlist-based npm package like `bad-words` or `leo-profanity` is enough for a thesis-scope system; no need for a full ML moderation API)
  - **Basic validity check** — reject empty messages, whitespace-only messages, or messages under a minimum length (e.g. spam like "asdasd")
- Run this check **client-side first** (instant feedback, no round trip) and **again server-side** (in the API route/Server Action) so it can't be bypassed by disabling JavaScript or hitting the endpoint directly
- On failure: block the submission entirely — nothing gets written to the `feedback` table — and show a toast notification, e.g. *"Your message contains inappropriate content and wasn't submitted. Please revise and try again."* for profanity, or *"Please enter a valid message."* for empty/too-short input
- Keep the wordlist and validation rules editable (a config file or a Supabase table) so the Barangay Secretary or Admin can add words later without a code change

---

## 5. Suggestions

1. **Role-based Approval tabs** — Admin sees all pending accounts; Secretary sees only pending Kagawad accounts.
2. **QR codes are per-official-record, not per-session** — generate once, reusable every session, so you don't have to reprint/regenerate QR codes each time.
4. **Resident tracking-code approach** is the simplest way to answer "can residents see their request status" without adding full resident accounts — recommend starting there, and only add resident login later if you find people losing their tracking codes.
5. **Keep analytics admin-only** — but consider giving Secretary a **simpler summary view** (not full analytics) since they're the one generating reports day-to-day.
6. **Add an audit trail** (who approved which secretary account, who responded to which feedback) — ties directly into your paper's "accountability" theme and strengthens your Testing/Evaluation chapter later.

---

## 6. Why this fits your existing paper

Your Statement of the Problem, Objectives, and Features sections stay mostly the same — this plan updates **how** the system is built (Section: System Development Methodology → Development, System Requirements). You'd update your **System Requirements** section to replace XAMPP/PHP/MySQL/Notepad++ with Next.js, Supabase, Resend, and Vercel. We have added the Kagawad role back into the system to handle Feedback, so your Conceptual Framework should reflect four roles (Admin, Secretary, Kagawad, Resident).
