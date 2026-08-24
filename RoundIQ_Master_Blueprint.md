# RoundIQ — Complete Product & Engineering Blueprint

**Parent Company:** Algorithyum
**Product:** RoundIQ — Human Technical Interview Marketplace
**Initial Domain:** roundiq.algorithyum.in
**Target Domain:** roundiq.com / roundiq.in
**Document Type:** Founding Product, Engineering & Operations Specification
**Version:** 1.0 (MVP Blueprint)
**Status:** Build-ready

> RoundIQ is a two-sided marketplace connecting students and job-seekers with verified, working software engineers for **real, human-conducted** mock technical interviews — booked like Calendly, discovered like Upwork, paid like Astrotalk, and operated with the rigor of Stripe. No AI interviewers. No canned question banks pretending to be interviews. Just real engineers, real pressure, real feedback.

---

## Table of Contents

1. Executive Summary
2. Product Vision
3. Product Goals
4. Success Metrics
5. Business Model
6. Revenue Streams
7. Market Analysis
8. Competitor Analysis
9. User Personas
10. User Journey Maps
11. Information Architecture
12. Sitemap
13. Functional Requirements
14. Non-Functional Requirements
15. User Stories
16. Acceptance Criteria
17. User Flows (Overview)
18. Booking Flow
19. Payment Flow
20. Wallet Flow
21. Interview Flow
22. Admin Flow
23. Interviewer Flow
24. Student Flow
25. Database Design
26. ER Diagram
27. Entity Definitions
28. API Design
29. Authentication Strategy
30. Authorization Matrix
31. Notification Architecture
32. Scheduling Architecture
33. Calendar Architecture
34. Payment Architecture
35. Commission System
36. Withdrawal System
37. Refund System
38. Edge Cases
39. Error Handling
40. Dashboard Requirements
41. Admin Panel Requirements
42. Security Requirements
43. Logging Requirements
44. Analytics Requirements
45. Product Backlog
46. Epics
47. Features
48. Stories
49. Sprint Planning
50. MVP Roadmap
51. Version 2 Roadmap
52. Version 3 Roadmap
53. Testing Strategy
54. QA Checklist
55. Deployment Strategy
56. DevOps Architecture
57. Folder Structure
58. Database Schema (SQL)
59. REST API Endpoints (Full Reference)
60. Future Scaling Strategy
61. Product Risks
62. Assumptions
63. Open Questions
64. Final Product Blueprint

---

## 1. Executive Summary

RoundIQ is a human-powered technical interview marketplace that connects students and working professionals ("Students") who need realistic interview practice with verified software engineers ("Interviewers") from real companies who are willing to conduct paid mock interviews. The platform's core transaction is simple — a Student books a time slot with an Interviewer in a specific category (DSA, System Design, React, etc.), pays through the platform, both parties meet on a generated Google Meet link, the Interviewer conducts a structured interview and submits written feedback, and the Interviewer is paid out (minus RoundIQ's commission) once the session is confirmed complete.

RoundIQ deliberately excludes AI-driven interviewing or feedback from the MVP. This is a strategic differentiation: the market is saturated with AI mock-interview tools (Pramp-style bots, LeetCode AI, various GPT wrappers) that fail to replicate the psychological pressure, communication nuance, and real hiring-manager judgment that only a human interviewer can provide. RoundIQ's wedge is authenticity and accountability — every interviewer is manually vetted, every session produces a structured, comparably-formatted feedback report, and every review is tied to a verified, completed, paid transaction (eliminating fake reviews).

The business is a classic double-sided marketplace with the same fundamental dynamics as Uber (supply liquidity vs. demand liquidity), Upwork (trust, verification, escrow), Calendly (availability and scheduling logic), and Astrotalk (pay-per-session, wallet-based commerce, rating-driven discovery). RoundIQ's initial go-to-market is India-first (Razorpay, INR pricing, college partnerships, tier-2/tier-3 student base hungry for interview practice), with an architecture designed to generalize to other geographies once payment rails (Stripe) and localization are added in V2.

This document is the complete founding specification: product strategy, UX flows, data model, API contracts, security posture, operational policies (cancellations, refunds, disputes, payouts), and a phased engineering roadmap from MVP to Series-A-ready platform. It is written to be handed directly to an engineering team to begin sprint planning without further product discovery.

---

## 2. Product Vision

**Vision statement:** *Every engineer who has ever sat on the other side of an interview table should be able to turn that experience into income — and every student who has ever frozen up in a real interview should be able to fail safely, first, with someone who has actually done the job.*

RoundIQ exists because the interview is the single highest-stakes, least-practiced ritual in a technical career. Students rehearse LeetCode problems in isolation but never rehearse the actual adversarial, real-time, judged conversation that determines outcomes. Meanwhile, thousands of mid-to-senior engineers who conduct interviews as part of their job have interviewing expertise that currently has zero monetizable value outside their employer.

RoundIQ's long-term vision is to become the default layer of "real practice" that sits between self-study (LeetCode, courses) and the actual hiring pipeline (company ATS, recruiters) — a marketplace so trusted that "I've done 12 RoundIQ interviews in System Design" becomes a credible signal on a resume, the way a Coursera certificate or a Kaggle rank currently is. In the long run this extends into an "Interview Passport" (a verified, portable interview performance record) and eventually a recruiter-facing marketplace where companies source directly from top-performing RoundIQ candidates.

The vision is deliberately **not** "AI interview prep." AI is explicitly deferred to the future roadmap as an assistive layer (resume screening, matching, feedback summarization) — never as a replacement for the core human transaction, which is RoundIQ's moat.

---

## 3. Product Goals

**MVP-phase goals (0–6 months post-launch):**

1. Enable a Student to discover, book, pay for, attend, and review a mock interview end-to-end with zero manual intervention from the RoundIQ team for a successful "happy path" booking.
2. Enable an Interviewer to apply, get verified, set availability and pricing, accept bookings, conduct sessions, submit feedback, and withdraw earnings — fully self-serve.
3. Achieve reliable double-sided trust: no double-bookings, no silent no-shows without penalty, no un-refunded failed sessions, no un-paid completed sessions.
4. Build an admin control plane robust enough that one operations person can manage verification, disputes, and refunds for the first 500–1,000 interviewers without needing engineering support for routine cases.
5. Prove commission-based unit economics are viable at small scale (see Section 6) before investing in paid growth.

**Post-MVP goals (6–18 months):**

6. Expand category depth (each domain gets its own structured feedback rubric).
7. Introduce college/university partnership channel for bulk student acquisition.
8. Introduce featured/promoted interviewer placements as a monetization lever.
9. Build the Interview Passport as a differentiated, defensible data asset.
10. Explore B2B: companies sourcing shortlists from top-rated RoundIQ interview performance.

---

## 4. Success Metrics

### North Star Metric
**Number of completed, paid, reviewed interview sessions per week** — this single metric captures supply availability, demand, payment health, and session completion all at once.

### Supply-side (Interviewer) Metrics
| Metric | Why it matters | MVP Target (Month 6) |
|---|---|---|
| Verified interviewers onboarded | Marketplace liquidity floor | 300–500 |
| Avg. weekly available slots per active interviewer | Prevents "ghost supply" | 4+ |
| Interviewer acceptance rate on bookings | Reliability of supply | >90% |
| Interviewer no-show rate | Trust/quality control | <2% |
| Avg. time-to-first-booking after verification | Onboarding health | <7 days |
| Interviewer repeat-session rate (month-over-month) | Retention/earnings satisfaction | >60% |

### Demand-side (Student) Metrics
| Metric | Why it matters | MVP Target (Month 6) |
|---|---|---|
| Student sign-up → first booking conversion | Funnel health | >15% |
| Repeat booking rate within 60 days | Product-market fit signal | >30% |
| Avg. rating given to interviewers | Quality assurance | >4.3/5 |
| Refund/dispute rate | Trust and payment health | <5% of bookings |
| Session completion rate (booked → conducted) | Core promise reliability | >92% |

### Marketplace/Financial Metrics
- Gross Booking Value (GBV) per month
- Take rate (commission %) realized vs. target
- Contribution margin per completed session (after payment gateway fees, refunds, payouts)
- CAC (blended) per Student and per Interviewer
- LTV:CAC ratio (target >3:1 by Month 12)
- Payout cycle time (booking completion → interviewer withdrawal availability)

### Platform Health Metrics
- P95 booking flow completion time
- Payment success rate (gateway level)
- Support ticket volume per 100 bookings
- Dispute resolution median time (target <48 hours)

---

## 5. Business Model

RoundIQ operates a **commission-based two-sided marketplace model**, structurally similar to Upwork/Astrotalk rather than a subscription (Calendly) or pure-lead-gen model. The platform never lets money change hands outside itself — all payment flows through RoundIQ's payment gateway and internal wallet ledger, which is what allows commission capture and dispute mediation to be enforceable.

**Core transaction unit:** One paid, booked interview session between one Student and one Interviewer, in one category, at one price point, for a fixed duration (30/45/60/90 minutes).

**Pricing control:** Interviewers set their own per-session price per duration tier (subject to admin-configured min/max bounds to prevent predatory underpricing or unrealistic overpricing that damages trust). RoundIQ does not fix prices — this mirrors Upwork/Astrotalk's freelancer-set-pricing model, which maximizes supply-side participation because experienced (FAANG-tier) interviewers can charge a premium over junior/mid-level interviewers.

**Commission structure:** RoundIQ takes a percentage-based commission on every completed and paid-out session (see Section 35 for the full commission system design). A tiered commission (higher % for new/low-volume interviewers, lower % for high-volume/loyal interviewers) is recommended to incentivize retention, similar to how Upwork reduces its fee as a freelancer-client relationship's lifetime billings grow.

**Trust enforcement as a business function:** Because RoundIQ mediates payment, it can also enforce cancellation policies, no-show penalties, and dispute resolution — these are not just UX features but are the mechanism that makes the commission defensible (both sides pay RoundIQ *for* the trust layer, not just for "introduction").

**Why not subscription (Calendly-style)?** A flat monthly subscription would be misaligned with the transactional, occasional nature of interview prep (a student books intensively for 4–8 weeks pre-interview season, then churns). Per-session commission captures value proportional to usage and matches Astrotalk's proven model in the Indian pay-per-consultation market.

---

## 6. Revenue Streams

**Primary (MVP):**
1. **Booking Commission** — X% of every completed session's price, deducted before interviewer payout. This is the only revenue stream required at MVP.

**Secondary (post-MVP, see Future Roadmap for sequencing):**
2. **Resume Reviews** — a new, lighter-weight session type (async or sync) where an Interviewer reviews and annotates a Student's resume for a smaller fixed fee.
3. **Career Guidance / Salary Negotiation Sessions** — new session categories, same booking/payment infrastructure, no new core engineering required beyond a new category type.
4. **Featured Interviewer Placements** — Interviewers pay a fee (or accept a higher commission tier) to appear at the top of search/browse results for a category — an Astrotalk/Upwork Ads-style monetization lever.
5. **Promotional Listings / Homepage Placement** — similar concept for cross-category visibility (e.g. "Top System Design Interviewers This Week").
6. **Company Hiring Channel** — companies pay to access a curated shortlist of top-performing Students (by Interview Passport score) for direct sourcing — a recruiting-marketplace layer.
7. **Enterprise Plans** — bootcamps, colleges, or companies purchase bulk session credits for their cohorts/employees at a negotiated rate.
8. **College Partnerships** — placement cells purchase RoundIQ credits/subscriptions for graduating batches; RoundIQ gets guaranteed demand-side volume, colleges get a placement-readiness tool.

Revenue diversification is intentionally sequenced *after* the core commission engine is proven — building Resume Review or Enterprise Plans before booking-commission unit economics are validated would be premature.

---

## 7. Market Analysis

**Target market (India-first):** India produces roughly 1.5–1.7 million engineering graduates annually, alongside a massive pool of 2–8 year experienced software professionals actively switching jobs in a market where technical interviews (especially DSA and System Design rounds at product companies) are widely recognized as a distinct, learnable-but-unpracticed skill separate from raw coding ability. Tier-2/Tier-3 college students in particular have high demand for interview exposure but the least access to alumni or industry networks who can give it informally.

**Market drivers:**
- Explosive growth of coding-education platforms (LeetCode, Striver's sheets, DSA bootcamps) has created a large population that is *technically prepared but interview-inexperienced*.
- Existing "mock interview" options are polarized: either free-and-informal (asking a friend, Discord communities — inconsistent quality) or AI-based (Pramp, interviewing.io's automated tools, various GPT wrappers — lacking real human judgment and structured accountability).
- Gig-economy comfort has normalized professionals monetizing expertise on the side (Upwork, Superpeer, Topmate, Astrotalk all validate the pattern in India specifically).
- Remote-first hiring has normalized video-call interviews, making a Google-Meet-based mock interview feel identical to the real thing — no credibility gap versus in-person practice.

**Market sizing (illustrative, not a substitute for dedicated market research):** If even 2% of India's ~1.5M annual CS/IT graduates purchase 2 mock interviews per year at an average price of ₹500–800, that is a ~₹1.5–2.4 billion (~$18–29M) annual GBV opportunity from graduating students alone — before counting working professionals preparing for lateral moves, who are typically willing to pay significantly more per session.

**Timing:** Layoff cycles and increased lateral hiring bar (2023–2026) have made "interview readiness" a widely-discussed pain point on LinkedIn/Twitter, increasing organic discoverability and content-marketing surface area for a platform like RoundIQ.

---

## 8. Competitor Analysis

| Competitor | Model | Strength | Weakness vs. RoundIQ |
|---|---|---|---|
| **Pramp / interviewing.io (peer)** | Free peer-to-peer or curated expert (interviewing.io) mock interviews | Established brand, some real engineers | Peer-matching quality is inconsistent; interviewing.io is US-centric and pricier; neither has a strong India-first payments/localization layer |
| **AI mock interview tools (various GPT wrappers, LeetCode AI mock, Google's Interview Warmup)** | AI-simulated interviewer | Free/cheap, infinitely scalable | No real human judgment, no accountability, doesn't replicate real interview pressure or nuanced feedback — explicitly the gap RoundIQ fills |
| **Astrotalk** | Human expert marketplace (astrology), pay-per-session, wallet model | Proven India-first commerce/wallet/commission playbook at massive scale | Different vertical entirely — but RoundIQ borrows its exact commerce mechanics |
| **Upwork/Topmate/Superpeer** | Generalist expert marketplace / creator monetization | Proven booking+payment+payout infrastructure pattern | Not specialized for structured technical interview feedback or verification of engineering credentials |
| **Calendly** | Scheduling infrastructure only | Best-in-class availability/booking UX | Not a marketplace — no payments, no matching, no reviews; RoundIQ borrows its scheduling UX patterns only |
| **Informal (friends, Discord, LinkedIn DMs)** | Free, informal | Zero cost | Wildly inconsistent quality, no structured feedback, no accountability, hard to schedule reliably |

**RoundIQ's defensible wedge:** the combination of (a) verified real-company engineers, (b) structured, comparable feedback reports across sessions, (c) enforced payment/commission/trust layer, and (d) India-first localized commerce — no single competitor combines all four. The AI tools compete on price/scale but not quality; the human marketplaces (Astrotalk/Upwork/Topmate) compete on commerce infrastructure but not domain specialization; interviewing.io/Pramp compete on domain specialization but not on India-first commerce or scale.

---

## 9. User Personas

### Persona 1 — "Ananya," The Anxious Final-Year Student
- 21, final-year B.Tech CSE, Tier-2 college, Chandigarh/Punjab region.
- Has solved 250+ LeetCode problems but has never done a live timed interview.
- Primary fear: freezing up when asked to think out loud.
- Budget-conscious (₹300–600 per session is the ceiling she'll pay without parental approval).
- Wants: realistic pressure, honest feedback on communication (not just correctness), a way to track improvement across multiple sessions.
- Discovery channel: Instagram/LinkedIn placement-prep content, college WhatsApp groups, YouTube tech-prep channels.

### Persona 2 — "Rohan," The Working Professional Switching Jobs
- 27, 4 years experience as a backend engineer, actively interviewing at product companies.
- Comfortable with DSA but weak specifically at System Design rounds.
- Higher budget (₹800–2000 per session), values interviewer's actual company pedigree ("I want someone who's actually interviewed at a company like the one I'm targeting").
- Time-constrained — books evenings/weekends, expects Calendly-level scheduling smoothness.
- Discovery channel: LinkedIn, referrals from peers who used the platform, targeted ads during layoff-news cycles.

### Persona 3 — "Priya," The Senior Engineer Interviewer
- 32, Senior SDE at a well-known product company, 8 years experience, has personally conducted 100+ interviews as part of her job.
- Wants supplemental income from a skill she already has, on her own schedule (a few hours per week).
- Cares about: not getting lowballed on price, not dealing with flaky/no-show students, smooth withdrawal of earnings, not having admin overhead.
- Discovery channel: LinkedIn posts from RoundIQ, referral from a friend already earning on the platform, targeted outreach to engineers at top companies.

### Persona 4 — "Admin Ops Team Member (Internal)"
- RoundIQ's own early operations hire.
- Responsible for verifying interviewer applications, resolving disputes, monitoring refund requests, and watching platform health dashboards.
- Needs: a single admin panel with clear queues (pending verifications, open disputes, flagged sessions) rather than needing engineering support for routine actions.


---

## 10. User Journey Maps

### 10.1 Student Journey — "First Interview Booking"

| Stage | Student Action | Emotion | RoundIQ Touchpoint | Risk if Broken |
|---|---|---|---|---|
| Awareness | Sees Instagram reel / LinkedIn post about RoundIQ | Curious, skeptical ("is this real people?") | Landing page must immediately answer "is this AI or human?" | Bounces if positioning is unclear |
| Sign-up | Registers with email/Google | Low friction expected | One-screen sign-up, Google OAuth preferred | Drop-off if form is long |
| Discovery | Browses interviewers by category/price/rating | Overwhelmed if too many choices, anxious about picking wrong | Search + filter UX, clear profile cards | Choice paralysis, low conversion |
| Evaluation | Opens 2-3 interviewer profiles, reads reviews | Trust-building moment | Profile depth: company, experience, LinkedIn/GitHub links, past reviews | Fake-looking profiles kill trust instantly |
| Booking | Picks slot, pays | Slight anxiety at payment moment | Fast, transparent checkout (price + commission NOT hidden, total price shown upfront) | Any payment friction = lost booking |
| Pre-session | Waits for reminder, may reschedule/cancel | Nervous anticipation | Email/notification reminders, clear reschedule/cancel policy | Anxiety spikes if no reminder sent |
| Session | Joins Google Meet, does the interview | High stress (intended — this is the value) | Meeting link auto-generated and accessible from dashboard | Meeting link failure = total value loss |
| Post-session | Receives structured feedback, leaves a review | Relief + reflection | Feedback report delivered promptly, easy review flow | Delayed feedback erodes perceived value |
| Retention | Books again for a different category/interviewer | Confidence building | Personalized "book again" prompts, session history/progress view | No repeat-prompt = lower LTV |

### 10.2 Interviewer Journey — "Becoming an Active Earner"

| Stage | Interviewer Action | Emotion | RoundIQ Touchpoint | Risk if Broken |
|---|---|---|---|---|
| Awareness | Learns RoundIQ pays engineers to mock-interview | Interested but wary of scams/low pay | Clear "how much can I earn" messaging | Distrust if it looks like an MLM/gig-scam |
| Application | Submits profile, experience, company, LinkedIn/GitHub, resume | Slight friction tolerance (they expect vetting) | Structured application form | Too-easy application = trust erosion ("if anyone can join, is it credible?") |
| Verification | Waits for admin review | Anxious, wants transparency on timeline | Status tracker ("Under Review" / "Approved" / "Needs More Info") | Silence during review = drop-off |
| Setup | Sets pricing, availability calendar | Wants control | Calendly-style availability builder | Clunky calendar UX = incomplete setup, no bookings |
| First booking | Gets notified of a booking request | Excitement + slight nervousness | Push/email notification, clear accept/reject window | Missed notification = missed booking = bad first impression |
| Session | Conducts interview via Meet | Focus | N/A (external tool) | N/A |
| Feedback | Submits structured feedback form | Should feel fast, not burdensome | Structured but not overly long feedback form | Feedback fatigue reduces future engagement |
| Payout | Requests withdrawal | Wants speed and transparency | Wallet balance clarity, fast withdrawal processing | Slow/opaque payout = platform abandonment (top churn risk) |
| Retention | Sets recurring weekly availability, becomes repeat earner | Satisfaction, habit formation | Earnings analytics, repeat booking prompts | No analytics = no sense of progress = churn |

---

## 11. Information Architecture

```
RoundIQ
├── Public (Unauthenticated)
│   ├── Landing Page
│   ├── How It Works
│   ├── Browse Interviewers (public preview, limited detail)
│   ├── Categories Overview
│   ├── Become an Interviewer (application landing)
│   ├── Pricing / How Commission Works
│   ├── Trust & Safety / Verification Explainer
│   ├── Blog / Content (SEO)
│   ├── Login
│   └── Sign Up (Student / Interviewer entry points)
│
├── Student Area (Authenticated)
│   ├── Dashboard (upcoming sessions, quick actions)
│   ├── Browse & Search Interviewers
│   ├── Interviewer Profile (detail view)
│   ├── Booking Checkout
│   ├── My Bookings (upcoming / past)
│   ├── Session Detail (meeting link, feedback report)
│   ├── Wallet (balance, transactions, refunds)
│   ├── Profile & Resume
│   ├── Notifications
│   └── Settings
│
├── Interviewer Area (Authenticated)
│   ├── Dashboard (earnings summary, upcoming sessions, pending requests)
│   ├── Profile & Verification Status
│   ├── Availability Calendar
│   ├── Pricing Settings
│   ├── Booking Requests (accept/reject)
│   ├── Session Detail (meeting link, feedback submission)
│   ├── Earnings & Analytics
│   ├── Wallet & Withdrawals
│   ├── Reviews & Ratings
│   ├── Notifications
│   └── Settings
│
└── Admin Area (Authenticated, RBAC-gated)
    ├── Dashboard (platform health KPIs)
    ├── Interviewer Verification Queue
    ├── User Management (Students + Interviewers)
    ├── Booking Management
    ├── Payments & Commission Overview
    ├── Refunds & Disputes Queue
    ├── Categories Management
    ├── Reports & Analytics
    ├── Audit & Activity Logs
    └── Platform Settings (commission rates, policy config)
```

---

## 12. Sitemap

**Public routes**
- `/` — Landing
- `/how-it-works`
- `/browse` — public interviewer browse (limited profile detail, CTA to sign up)
- `/interviewers/:slug` — public profile preview
- `/categories`
- `/become-an-interviewer`
- `/pricing`
- `/trust-and-safety`
- `/blog`, `/blog/:slug`
- `/login`
- `/signup` and `/signup/interviewer`

**Student routes** (`/student/...`, auth required, role=student)
- `/student/dashboard`
- `/student/browse`
- `/student/interviewers/:id`
- `/student/book/:interviewerId`
- `/student/checkout/:bookingId`
- `/student/bookings`
- `/student/bookings/:id`
- `/student/wallet`
- `/student/profile`
- `/student/notifications`
- `/student/settings`

**Interviewer routes** (`/interviewer/...`, auth required, role=interviewer)
- `/interviewer/dashboard`
- `/interviewer/apply` (pre-verification)
- `/interviewer/profile`
- `/interviewer/availability`
- `/interviewer/pricing`
- `/interviewer/bookings`
- `/interviewer/bookings/:id`
- `/interviewer/earnings`
- `/interviewer/wallet`
- `/interviewer/reviews`
- `/interviewer/notifications`
- `/interviewer/settings`

**Admin routes** (`/admin/...`, auth required, role=admin, RBAC-scoped)
- `/admin/dashboard`
- `/admin/verifications`
- `/admin/users`
- `/admin/bookings`
- `/admin/payments`
- `/admin/refunds`
- `/admin/disputes`
- `/admin/categories`
- `/admin/reports`
- `/admin/logs`
- `/admin/settings`

---

## 13. Functional Requirements

**FR-1 Authentication & Accounts**
- FR-1.1 Users can register via email/password or Google OAuth.
- FR-1.2 Users select a role at signup (Student or Interviewer); Interviewer role additionally requires application + verification before activation.
- FR-1.3 System enforces email verification before first booking/session activity.
- FR-1.4 Password reset via email token flow.

**FR-2 Student Capabilities**
- FR-2.1 Student can search/filter interviewers by category, price range, experience, rating, company, availability window.
- FR-2.2 Student can view full interviewer profile including verified badges, bio, experience, reviews.
- FR-2.3 Student can select an available slot and initiate booking.
- FR-2.4 Student can pay via Razorpay (UPI, cards, netbanking, wallet balance).
- FR-2.5 Student receives booking confirmation with a generated Google Meet link.
- FR-2.6 Student can cancel/reschedule per cancellation policy (Section 37/38).
- FR-2.7 Student can view session history and structured feedback reports.
- FR-2.8 Student can submit a rating + written review after session completion.
- FR-2.9 Student can request a refund per policy triggers (interviewer no-show, technical failure, etc.).
- FR-2.10 Student can upload/update a resume.
- FR-2.11 Student can view and top up wallet balance; wallet balance usable at checkout.

**FR-3 Interviewer Capabilities**
- FR-3.1 Interviewer can submit an application (experience, current/past company, LinkedIn, GitHub, resume, skills, target categories).
- FR-3.2 Interviewer application enters an Admin verification queue; interviewer sees status (Pending/Approved/Rejected/Needs Info).
- FR-3.3 Verified interviewer can set per-category pricing for each supported duration (30/45/60/90 min).
- FR-3.4 Interviewer can build a recurring weekly availability calendar with timezone support and block out holidays/exceptions.
- FR-3.5 Interviewer receives booking requests and can accept or reject within a configurable response window.
- FR-3.6 Interviewer conducts session via generated Meet link.
- FR-3.7 Interviewer submits structured feedback (technical skills, problem solving, communication, strengths, weaknesses, suggestions, overall recommendation) within a required time window post-session.
- FR-3.8 Interviewer views earnings breakdown (gross, commission deducted, net) and analytics (sessions conducted, average rating, repeat-student rate).
- FR-3.9 Interviewer can request withdrawal of available wallet balance to linked bank account/UPI.

**FR-4 Admin Capabilities**
- FR-4.1 Admin can review, approve, reject, or request more info on interviewer applications.
- FR-4.2 Admin can view/manage all users (suspend, ban, edit role).
- FR-4.3 Admin can view/manage all bookings, including manual override for edge cases.
- FR-4.4 Admin can view payment/commission ledgers and reconcile transactions.
- FR-4.5 Admin can process/approve/deny refund requests and mediate disputes.
- FR-4.6 Admin can manage interview categories (add/edit/deprecate).
- FR-4.7 Admin can configure commission tiers and cancellation/refund policy parameters.
- FR-4.8 Admin can view platform analytics dashboards and audit logs.

**FR-5 Notifications**
- FR-5.1 System sends transactional emails/browser notifications for: booking confirmation, booking cancellation, session reminder (24h and 1h before), payment success/failure, withdrawal status updates, new review received, feedback submission reminder, dispute status updates.

**FR-6 Meeting**
- FR-6.1 System auto-generates a Google Meet link at booking confirmation (via Google Calendar API) and attaches it to both parties' booking detail views and reminder notifications.

---

## 14. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Availability** | 99.5% uptime target for booking/payment paths in MVP; upgrade to 99.9% by V2 |
| **Performance** | P95 API response time < 400ms for read endpoints, < 1200ms for booking/payment write endpoints |
| **Scalability** | Stateless API layer horizontally scalable behind load balancer; DB read replicas introduced when read QPS exceeds single-instance capacity |
| **Security** | All traffic over HTTPS/TLS 1.2+; secrets in a managed secrets store, never in code/env files committed to VCS |
| **Data Integrity** | No double-booking of a slot is possible under concurrent requests (enforced via DB-level unique constraint + row locking, not just application logic) |
| **Auditability** | Every state-changing action on bookings, payments, and wallets is logged immutably with actor, timestamp, before/after state |
| **Compliance** | PCI-DSS scope minimized by never storing raw card data (delegated entirely to Razorpay); GDPR/India DPDP-aligned data handling for PII |
| **Localization readiness** | Currency, timezone, and date formatting abstracted from day one even though MVP is INR/IST-only |
| **Accessibility** | WCAG 2.1 AA target for core booking flow (keyboard navigation, screen-reader labels, color contrast) |
| **Browser support** | Latest 2 versions of Chrome, Safari, Edge, Firefox; mobile-responsive (not native app) for MVP |
| **Disaster Recovery** | Automated daily DB backups with 30-day retention; RPO ≤ 24h, RTO ≤ 4h for MVP |
| **Observability** | Centralized structured logging, error tracking (e.g. Sentry), and uptime/latency monitoring from day one |

---

## 15. User Stories

**Student stories**
- As a Student, I want to filter interviewers by price and category so that I can find someone within my budget for the skill I need to practice.
- As a Student, I want to see an interviewer's company and experience so that I can trust their expertise before paying.
- As a Student, I want to pay securely and get instant confirmation so that I don't worry about whether my booking succeeded.
- As a Student, I want a reminder before my session so that I don't miss it.
- As a Student, I want structured feedback after my session so that I know exactly what to improve.
- As a Student, I want to request a refund if my interviewer doesn't show up so that I don't lose money for a service I didn't receive.

**Interviewer stories**
- As an Interviewer, I want to set my own price per session so that my rate reflects my experience level.
- As an Interviewer, I want to control my own availability so that this fits around my full-time job.
- As an Interviewer, I want to be notified immediately of a new booking request so that I can respond before it expires.
- As an Interviewer, I want to see my earnings clearly broken down so that I trust the commission calculation.
- As an Interviewer, I want to withdraw my earnings quickly and reliably so that this remains worth my time.

**Admin stories**
- As an Admin, I want a queue of pending interviewer verifications so that I can process them efficiently.
- As an Admin, I want to see flagged/disputed sessions in one place so that I can resolve them within SLA.
- As an Admin, I want to configure commission rates without a code deploy so that business terms can change quickly.
- As an Admin, I want an audit trail of every refund and payout so that I can reconcile finances and investigate fraud.

---

## 16. Acceptance Criteria (Representative Examples)

**Story: Student books a session**
- Given a Student is viewing an Interviewer's available slots, when they select a slot and complete payment successfully, then a Booking record is created with status `CONFIRMED`, a Google Meet link is generated and attached, and both Student and Interviewer receive a confirmation notification.
- Given two Students attempt to book the same slot simultaneously, when both submit at nearly the same time, then only one booking succeeds and the second receives a "slot no longer available" error with no charge made.
- Given a Student's payment fails, when the failure is returned by Razorpay, then no Booking is created, the Student sees a clear error, and the slot remains available for others.

**Story: Interviewer submits feedback**
- Given a session's scheduled end time has passed, when the Interviewer opens the session detail, then they see a required structured feedback form.
- Given the Interviewer has not submitted feedback within 48 hours of session end, then the system sends escalating reminder notifications and flags the booking for Admin visibility if unresolved after 72 hours.
- Given feedback is submitted, then the Booking status transitions to `COMPLETED`, the payment is marked eligible for release per the payout schedule, and the Student is notified feedback is ready.

**Story: Refund request**
- Given an Interviewer marks a session as a no-show on their end, or a Student reports a no-show, when Admin reviews and confirms via evidence (both parties' join/attendance signals), then a full refund is issued to the Student's wallet or original payment method, and the Interviewer's payout for that booking is withheld/reversed.

---

## 17. User Flows (Overview)

RoundIQ has four primary flow families, detailed individually in Sections 18–24:

1. **Booking Flow** — discovery through payment confirmation.
2. **Payment Flow** — checkout through settlement/payout eligibility.
3. **Wallet Flow** — balance management for both Student (refund credits, prepay) and Interviewer (earnings, withdrawals).
4. **Interview Flow** — from confirmed booking through session conduct through feedback/review.

Each flow is designed as a finite state machine with explicit statuses (see Section 27 Entity Definitions for the canonical `Booking.status` enum) so that engineering can implement guarded state transitions rather than ad hoc boolean flags.


---

## 18. Booking Flow (Detailed)

**Actors:** Student, Interviewer (passive until acceptance step), System.

**Preconditions:** Student is authenticated and email-verified. Interviewer is verified and has published availability.

**Step-by-step:**

1. Student searches/filters interviewers → selects an Interviewer profile.
2. System displays Interviewer's live availability calendar (converted to Student's local timezone).
3. Student selects a category, duration (30/45/60/90 min), and an open slot.
4. System locks the slot (soft-lock, 10-minute hold with a countdown) to prevent it being taken mid-checkout.
5. Student proceeds to checkout: sees session price, RoundIQ is transparent that a platform fee is included in the displayed total (no surprise fees at payment step), selects payment method (Razorpay: UPI/card/netbanking, or Wallet balance).
6. Student completes payment via Razorpay.
7. On payment webhook success:
   a. Booking record created with status `PENDING_INTERVIEWER_CONFIRMATION` **or** `CONFIRMED` depending on chosen model (see decision below).
   b. Slot is permanently marked unavailable (hard lock).
   c. Google Calendar API call generates a Meet link, invite sent to both parties.
   d. Confirmation notifications sent to Student and Interviewer.
8. **Decision point — auto-confirm vs. interviewer-accept model:** RoundIQ MVP uses an **auto-confirm-with-reject-window** model rather than a pre-payment accept/reject model. Rationale: requiring Interviewer acceptance *before* payment (Upwork-proposal-style) adds friction and risk of abandoned bookings while waiting; instead, because availability is Interviewer-published (they already said "I'm free then"), payment confirms the booking immediately, but the Interviewer retains a short window (e.g., 2 hours) to reject with cause (emergency), which triggers an automatic full refund and an availability-reliability strike against the Interviewer if this happens repeatedly.
9. If Interviewer does not reject within the window, booking is final: status `CONFIRMED`.
10. 24-hour and 1-hour reminder notifications sent to both parties.
11. At scheduled time, both parties join via the Meet link (external to RoundIQ).
12. Post-session: Interviewer submits structured feedback → Booking status `COMPLETED`.
13. Student is prompted to rate/review.
14. Payment is queued for payout per the payout schedule (Section 36).

**Cancellation branch:** see Section 38 (Edge Cases) and cancellation policy details.

---

## 19. Payment Flow (Detailed)

1. Student initiates checkout with a booking summary (category, interviewer, duration, price, applicable wallet-credit toggle).
2. Backend creates an internal `Order` record (status `CREATED`) and a corresponding Razorpay Order via server-side API call (amount, currency=INR, receipt ID = internal order ID).
3. Frontend opens Razorpay Checkout with the returned `razorpay_order_id`.
4. Student completes payment in the Razorpay-hosted UI (RoundIQ never touches raw card/UPI credentials — PCI scope stays with Razorpay).
5. Razorpay returns a client-side success callback **and** independently fires a server-side webhook (`payment.captured`). **The webhook, not the client callback, is the source of truth** — client callbacks can be spoofed or lost on network failure.
6. Backend verifies webhook signature (HMAC with Razorpay webhook secret) to prevent forged payment confirmations.
7. On verified `payment.captured`:
   a. `Order.status = PAID`.
   b. `Booking` created/confirmed (per Section 18).
   c. `Transaction` ledger entry created: type=`BOOKING_PAYMENT`, debit from Student's effective payment source, credit to platform escrow balance (not yet to Interviewer wallet — held until session completion per Section 34).
8. If webhook indicates `payment.failed`, Order marked `FAILED`, slot lock released, Student shown retry option.
9. Idempotency: webhook handler is idempotent on Razorpay's event ID to safely handle retried webhook deliveries without double-crediting.
10. On session completion + feedback submission, escrowed amount splits: commission % → Platform Revenue ledger, remainder → Interviewer Wallet (available balance, subject to any hold period, see Section 36).

---

## 20. Wallet Flow (Detailed)

RoundIQ maintains **two wallet types** sharing one underlying ledger schema:

**Student Wallet**
- Credited by: refunds (full or partial), promotional credits (future), referral credits (future).
- Debited by: applying wallet balance toward a new booking at checkout.
- Cannot be withdrawn to bank by Students in MVP (refund-credit only, not a cash-out mechanism) — this avoids RoundIQ being classified as a payment/e-wallet issuer requiring additional regulatory licensing in India (RBI PPI rules) beyond what Razorpay's route/escrow model already permits. This constraint should be explicitly validated with legal counsel before launch.

**Interviewer Wallet**
- Credited by: net earnings from completed, feedback-submitted sessions (escrow release).
- Debited by: withdrawal requests (to linked bank account/UPI via Razorpay Payouts/RazorpayX).
- Displays: Available Balance (withdrawable now), Pending Balance (in sessions not yet completed/escrow not yet released), Lifetime Earnings.

**Ledger design principle:** every wallet balance is a *derived* value computed from an immutable, append-only `Transaction`/`LedgerEntry` table — the wallet "balance" shown in UI is a cached/materialized sum, never the source of truth itself. This is the same pattern used by Stripe Connect and every serious fintech ledger, and it is what makes reconciliation and dispute investigation possible.

**Withdrawal flow (Interviewer):**
1. Interviewer requests withdrawal of up to their Available Balance.
2. System creates `WithdrawalRequest` (status `PENDING`).
3. Admin (or automated rule for trusted/verified interviewers with a clean history, post-MVP) approves.
4. Backend triggers a RazorpayX Payout to Interviewer's linked bank account/UPI.
5. On payout webhook success, `WithdrawalRequest.status = COMPLETED`, wallet Available Balance decremented, Transaction ledger entry recorded.
6. On payout failure, status = `FAILED`, balance restored, Interviewer notified with reason and asked to verify payout details.

---

## 21. Interview Flow (Detailed)

1. **Pre-session:** Both parties see the session in "Upcoming" with the Meet link, category, and any prep notes the Student optionally added at booking time (e.g., "please focus on graph problems").
2. **Session start:** No in-platform video is built for MVP — parties join Google Meet directly. RoundIQ dashboard shows a "Join Meeting" button and a live countdown/status indicator.
3. **During session:** Fully external to RoundIQ (by design — no recording, no AI observation in MVP, consistent with the "No AI, fully human" principle).
4. **Session end:** At scheduled end time, system prompts Interviewer (via email + in-app banner) to submit structured feedback.
5. **Feedback submission (Interviewer-only, required):**
   - Technical Skills (rating + notes)
   - Problem Solving (rating + notes)
   - Communication (rating + notes)
   - Strengths (free text)
   - Weaknesses (free text)
   - Improvement Suggestions (free text)
   - Overall Recommendation: `READY` / `ALMOST_READY` / `NEEDS_IMPROVEMENT`
6. **Feedback deadline:** 48 hours, with reminders at 12h and 36h; unresolved after 72h auto-escalates to Admin queue and may trigger a partial hold on the Interviewer's future payouts until resolved (anti-abuse measure against interviewers who take payment but ghost on feedback).
7. **Review (Student-only, optional but incentivized):** Star ratings across Communication / Technical Knowledge / Professionalism / Helpfulness / Overall, plus a written review. Reviews are only postable for `COMPLETED` bookings tied to a real payment — eliminating fake reviews structurally.
8. **Booking closes:** status `COMPLETED`; both parties' dashboards reflect it in history; payout escrow releases per Section 34.

---

## 22. Admin Flow (Detailed)

**Verification queue flow:**
1. New Interviewer application enters queue with status `SUBMITTED`.
2. Admin reviews: identity documents, LinkedIn profile cross-check, GitHub activity, resume, claimed company/experience.
3. Admin can: `APPROVE` (interviewer activated, can set pricing/availability), `REJECT` (with reason, applicant notified), or `REQUEST_MORE_INFO` (status returns to applicant with specific ask, e.g. "please link a company email or provide an offer letter").
4. All verification decisions logged with admin identity + timestamp + reason (audit requirement).

**Dispute/refund queue flow:**
1. Disputes enter queue triggered by: Student refund request, Interviewer no-show flag, mutual disagreement flagged by either party, automated flag (e.g., feedback never submitted).
2. Admin views full context: booking details, payment status, both parties' account history/strike count, any uploaded evidence, chat/message history if applicable.
3. Admin resolves with one of: `FULL_REFUND_TO_STUDENT`, `PARTIAL_REFUND`, `NO_REFUND_RELEASE_TO_INTERVIEWER`, `ESCALATE` (for legal/complex cases).
4. Resolution triggers corresponding Wallet/Transaction updates automatically (no manual money movement outside the system).

**General admin capabilities:** platform-wide search across users/bookings/transactions; ability to suspend/ban a user (with cascading effects — e.g., banned Interviewer's future availability auto-removed, existing confirmed bookings flagged for Admin re-assignment or refund); configuration screens for commission tiers, cancellation policy parameters, and category management, all without requiring a code deploy.

---

## 23. Interviewer Flow (Detailed)

1. **Application:** submits profile — name, current role/company, years of experience, target interview categories, LinkedIn URL, GitHub URL, resume upload, a short bio, and proposed pricing (subject to admin min/max bounds per category).
2. **Verification wait:** sees status tracker; can edit/resubmit if `REQUEST_MORE_INFO`.
3. **Activation:** upon `APPROVED`, gains access to Availability Calendar and Pricing settings; profile becomes publicly discoverable.
4. **Availability setup:** defines recurring weekly availability blocks (e.g., "Mon/Wed/Fri 7–9 PM IST"), timezone auto-detected/configurable, can mark one-off exceptions (holidays, unavailable dates) and block specific slots.
5. **Ongoing operation:** receives booking notifications (auto-confirmed per Section 18's model, with a reject-with-cause window), manages upcoming session list, joins sessions, submits feedback, monitors incoming reviews.
6. **Earnings management:** views Dashboard analytics — sessions this month, average rating trend, repeat-student %, earnings graph; requests withdrawals from Wallet.
7. **Reputation management:** views all received reviews; can (per policy) flag a review as abusive/fraudulent for Admin review, but cannot delete legitimate reviews (review integrity is core to platform trust).

---

## 24. Student Flow (Detailed)

1. **Sign-up:** registers, optionally uploads resume immediately or later.
2. **Discovery:** browses/searches interviewers; can filter by category, price range, minimum rating, experience level, company, and available-within-X-days.
3. **Evaluation:** opens interviewer profile — bio, experience, verified badges, company, LinkedIn/GitHub, category-specific pricing, aggregate rating breakdown, written reviews from past students.
4. **Booking:** selects slot → checkout → pays.
5. **Pre-session:** can view upcoming session details, reschedule/cancel per policy, optionally leave a prep note for the Interviewer.
6. **Session:** joins via Meet link from dashboard.
7. **Post-session:** receives structured feedback report, submits rating + review, session moves to history.
8. **Ongoing:** manages Wallet (refund credits), views full booking history and cumulative feedback across sessions (a lightweight precursor to the future "Interview Passport"), manages notification preferences and profile/resume.


---

## 25. Database Design

**Engine:** PostgreSQL (primary transactional store) + Redis (caching, slot-lock/session-lock, rate-limiting, job queues).

**Design principles:**
- Every monetary amount stored as integer minor units (paise, not rupees-as-float) to avoid floating-point rounding errors — a hard rule for any payment system.
- Every state-changing entity (Booking, Order, Transaction, WithdrawalRequest, Dispute) has an explicit `status` enum column with application-level guarded transitions, never free-text status.
- Soft deletes (`deleted_at` nullable timestamp) on user-facing entities where audit history matters; hard deletes avoided.
- All timestamps stored in UTC; timezone conversion happens at the presentation layer only.
- Foreign keys enforced at the DB level (not just application level) to guarantee referential integrity for financial data.
- Slot availability uses a DB-level unique constraint on `(interviewer_id, start_time)` combined with a `SELECT ... FOR UPDATE` row lock during booking creation to make double-booking structurally impossible, not just unlikely.

High-level table groups:
1. **Identity** — `users`, `student_profiles`, `interviewer_profiles`, `interviewer_verifications`
2. **Catalog** — `categories`, `interviewer_category_pricing`
3. **Scheduling** — `availability_rules`, `availability_exceptions`, `slots`
4. **Transactions** — `bookings`, `orders`, `payments`, `transactions` (ledger), `wallets`
5. **Post-session** — `feedback_reports`, `reviews`
6. **Operations** — `withdrawal_requests`, `disputes`, `refunds`
7. **Platform** — `notifications`, `audit_logs`, `admin_users`, `platform_settings`

---

## 26. ER Diagram (Textual)

```
users (1) ──── (1) student_profiles
users (1) ──── (1) interviewer_profiles ──── (1) interviewer_verifications
interviewer_profiles (1) ──── (M) interviewer_category_pricing (M) ──── (1) categories
interviewer_profiles (1) ──── (M) availability_rules
interviewer_profiles (1) ──── (M) availability_exceptions
interviewer_profiles (1) ──── (M) slots
slots (1) ──── (0..1) bookings
student_profiles (1) ──── (M) bookings
bookings (1) ──── (1) orders ──── (1) payments
bookings (1) ──── (0..1) feedback_reports
bookings (1) ──── (0..1) reviews
bookings (1) ──── (M) transactions
users (1) ──── (1) wallets
wallets (1) ──── (M) transactions
interviewer_profiles (1) ──── (M) withdrawal_requests
bookings (1) ──── (0..1) disputes
disputes (1) ──── (0..1) refunds
users (1) ──── (M) notifications
users/admin_users (1) ──── (M) audit_logs (as actor)
categories (1) ──── (M) interviewer_category_pricing
```

---

## 27. Entity Definitions

**`users`**
`id (uuid, pk)`, `email (unique)`, `password_hash (nullable, if OAuth-only)`, `google_id (nullable)`, `role (enum: student, interviewer, admin)`, `status (enum: active, suspended, banned)`, `email_verified_at`, `created_at`, `updated_at`, `deleted_at`.

**`student_profiles`**
`id`, `user_id (fk users)`, `full_name`, `phone`, `resume_url`, `timezone`, `college_name (nullable)`, `graduation_year (nullable)`, `created_at`, `updated_at`.

**`interviewer_profiles`**
`id`, `user_id (fk users)`, `full_name`, `bio`, `current_company`, `current_title`, `years_experience`, `linkedin_url`, `github_url`, `resume_url`, `timezone`, `verification_status (enum: submitted, needs_info, approved, rejected)`, `average_rating (materialized)`, `total_sessions_completed (materialized)`, `created_at`, `updated_at`.

**`interviewer_verifications`**
`id`, `interviewer_id (fk)`, `reviewed_by (fk admin_users, nullable)`, `status (enum)`, `admin_notes`, `submitted_documents (jsonb)`, `decided_at`, `created_at`.

**`categories`**
`id`, `name` (e.g. "DSA", "System Design", "React"), `slug`, `is_active`, `description`, `created_at`.

**`interviewer_category_pricing`**
`id`, `interviewer_id (fk)`, `category_id (fk)`, `duration_minutes (enum: 30,45,60,90)`, `price_minor_units (int)`, `currency (default INR)`, `is_active`.

**`availability_rules`** (recurring weekly pattern)
`id`, `interviewer_id (fk)`, `day_of_week (0-6)`, `start_time_local`, `end_time_local`, `timezone`, `is_active`.

**`availability_exceptions`** (one-off overrides/holidays)
`id`, `interviewer_id (fk)`, `date`, `type (enum: blocked, added)`, `start_time (nullable)`, `end_time (nullable)`.

**`slots`** (materialized bookable units, generated from rules minus exceptions minus existing bookings)
`id`, `interviewer_id (fk)`, `start_time (utc)`, `end_time (utc)`, `duration_minutes`, `status (enum: open, held, booked)`, `held_until (nullable, for soft-lock)`.

**`bookings`**
`id`, `student_id (fk)`, `interviewer_id (fk)`, `slot_id (fk)`, `category_id (fk)`, `duration_minutes`, `price_minor_units`, `commission_minor_units`, `interviewer_payout_minor_units`, `status (enum: pending_payment, confirmed, interviewer_rejected, cancelled_by_student, cancelled_by_interviewer, no_show_student, no_show_interviewer, completed, disputed)`, `meet_link`, `student_prep_notes`, `scheduled_start (utc)`, `scheduled_end (utc)`, `created_at`, `updated_at`.

**`orders`**
`id`, `booking_id (fk)`, `razorpay_order_id`, `amount_minor_units`, `currency`, `status (enum: created, paid, failed)`, `created_at`.

**`payments`**
`id`, `order_id (fk)`, `razorpay_payment_id`, `method (upi/card/netbanking/wallet)`, `status`, `captured_at`, `raw_gateway_payload (jsonb)`.

**`wallets`**
`id`, `user_id (fk)`, `wallet_type (enum: student, interviewer)`, `available_balance_minor_units (materialized)`, `pending_balance_minor_units (materialized)`, `updated_at`.

**`transactions`** (immutable ledger — the source of truth for all balances)
`id`, `wallet_id (fk, nullable for platform-only entries)`, `booking_id (fk, nullable)`, `type (enum: booking_payment, commission_capture, payout_release, withdrawal, refund, penalty)`, `amount_minor_units`, `direction (enum: credit, debit)`, `balance_after_minor_units`, `created_at`, `metadata (jsonb)`.

**`feedback_reports`**
`id`, `booking_id (fk, unique)`, `technical_skills_rating`, `technical_skills_notes`, `problem_solving_rating`, `problem_solving_notes`, `communication_rating`, `communication_notes`, `strengths (text)`, `weaknesses (text)`, `improvement_suggestions (text)`, `overall_recommendation (enum: ready, almost_ready, needs_improvement)`, `submitted_at`.

**`reviews`**
`id`, `booking_id (fk, unique)`, `student_id (fk)`, `interviewer_id (fk)`, `communication_rating`, `technical_knowledge_rating`, `professionalism_rating`, `helpfulness_rating`, `overall_rating`, `written_review (text, nullable)`, `is_flagged`, `created_at`.

**`withdrawal_requests`**
`id`, `interviewer_id (fk)`, `amount_minor_units`, `status (enum: pending, approved, processing, completed, failed, rejected)`, `payout_method (bank/upi)`, `razorpayx_payout_id (nullable)`, `requested_at`, `processed_at`.

**`disputes`**
`id`, `booking_id (fk)`, `raised_by (fk users)`, `type (enum: no_show, quality_complaint, payment_issue, other)`, `description`, `status (enum: open, under_review, resolved)`, `resolution_type (enum, nullable)`, `resolved_by (fk admin_users, nullable)`, `created_at`, `resolved_at`.

**`refunds`**
`id`, `booking_id (fk)`, `dispute_id (fk, nullable)`, `amount_minor_units`, `refund_to (enum: wallet, original_method)`, `status (enum: pending, processed, failed)`, `processed_at`.

**`notifications`**
`id`, `user_id (fk)`, `type`, `title`, `body`, `is_read`, `channel (enum: email, in_app)`, `related_entity_type`, `related_entity_id`, `created_at`.

**`audit_logs`**
`id`, `actor_id`, `actor_type (enum: user, admin, system)`, `action`, `entity_type`, `entity_id`, `before_state (jsonb)`, `after_state (jsonb)`, `ip_address`, `created_at`.

**`admin_users`**
`id`, `user_id (fk)`, `permission_level (enum: super_admin, ops_admin, support_agent)`, `created_at`.

**`platform_settings`**
`id`, `key`, `value (jsonb)`, `updated_by`, `updated_at` — used for commission tiers, cancellation windows, min/max pricing bounds, feedback deadlines, etc., all editable without a deploy.

---

## 28. API Design

**Style:** REST over HTTPS, JSON payloads, versioned under `/api/v1/`. Auth via short-lived JWT access tokens + long-lived rotating refresh tokens (see Section 29).

**Design conventions:**
- Resource-oriented URLs, standard HTTP verbs, standard status codes.
- All list endpoints support pagination (`?page=&limit=`) and return `{ data: [...], meta: { total, page, limit } }`.
- All mutating endpoints require `Idempotency-Key` header for payment/booking-critical operations to safely handle retries.
- Errors returned as `{ error: { code, message, details } }` with consistent machine-readable `code` values (see Section 39).
- Webhooks (Razorpay) are separate, unauthenticated-but-signature-verified endpoints under `/api/v1/webhooks/`.

Full endpoint reference is in Section 59.

---

## 29. Authentication Strategy

- **Primary methods:** Email/password (bcrypt/argon2 hashed) and Google OAuth 2.0.
- **Token model:** JWT access token (short-lived, 15 min) + opaque refresh token (long-lived, 30 days, stored hashed server-side, rotated on each use — rotation-on-use prevents replay of a stolen refresh token past its single use).
- **Session invalidation:** refresh tokens revocable server-side (logout, password change, suspicious activity, admin-forced logout).
- **Email verification:** required before first booking/session action; unverified accounts can browse but not transact.
- **Password policy:** minimum 8 characters, breach-list check (e.g., via HaveIBeenPwned range API) recommended at signup.
- **MFA:** not required for MVP for Students; **recommended for Admin accounts from day one** given financial control surface; roadmap item for Interviewers given payout access.
- **Rate limiting on auth endpoints:** login/signup/password-reset endpoints rate-limited per IP and per account to mitigate credential stuffing/brute force.

---

## 30. Authorization Matrix

| Action | Student | Interviewer | Admin (Ops) | Admin (Super) |
|---|---|---|---|---|
| Browse interviewers | ✅ | ✅ | ✅ | ✅ |
| Book a session | ✅ | ❌ | ❌ | ❌ |
| Set own availability/pricing | ❌ | ✅ (own only) | ❌ | ✅ (override) |
| Accept/reject own booking | ❌ | ✅ (own only) | ✅ (override) | ✅ |
| Submit feedback | ❌ | ✅ (own sessions only) | ❌ | ❌ |
| Submit review | ✅ (own sessions only) | ❌ | ❌ | ❌ |
| View own wallet/earnings | ✅ (own) | ✅ (own) | ✅ (any, read-only) | ✅ (any) |
| Request withdrawal | ❌ | ✅ (own only) | ❌ | ❌ |
| Approve withdrawal | ❌ | ❌ | ✅ | ✅ |
| Approve interviewer verification | ❌ | ❌ | ✅ | ✅ |
| Resolve disputes/refunds | ❌ | ❌ | ✅ | ✅ |
| Suspend/ban a user | ❌ | ❌ | ✅ (with limits) | ✅ |
| Configure commission/policy settings | ❌ | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ✅ (scoped) | ✅ (full) |

Enforcement: role + resource-ownership checks performed server-side on every request (never trust client-side role display); admin actions additionally require the `admin_users.permission_level` check for sensitive settings endpoints.

---

## 31. Notification Architecture

**Channels (MVP):** Email (transactional, via a provider such as SES/Postmark/SendGrid) + in-app/browser notifications. SMS/WhatsApp deferred to roadmap given added cost/complexity, but the architecture reserves a `channel` field to add them later without a schema change.

**Delivery pattern:** event-driven. Domain events (e.g. `BookingConfirmed`, `PaymentFailed`, `FeedbackSubmitted`, `WithdrawalCompleted`) are published to a queue (e.g. Redis-backed job queue such as BullMQ) and consumed by a Notification Worker that renders templates and dispatches via the appropriate channel — decoupling notification delivery from the request/response cycle of the core API.

**Reliability:** failed sends are retried with exponential backoff; persistent failures are logged and surfaced on an Admin "notification health" view rather than silently dropped, since a missed booking-confirmation or session-reminder email directly damages trust.

**Notification catalog (MVP):**
- Booking confirmed (Student + Interviewer)
- Booking cancelled (both, with reason)
- Session reminder — 24h and 1h before (both)
- Payment success / payment failed (Student)
- Feedback submitted / feedback overdue reminder (Student / Interviewer respectively)
- Review received (Interviewer)
- Withdrawal requested / completed / failed (Interviewer)
- Verification status changed (Interviewer)
- Dispute opened / resolved (relevant party)

---

## 32. Scheduling Architecture

**Core challenge:** convert an Interviewer's recurring availability rules + one-off exceptions + already-booked slots into a reliable, race-condition-free set of bookable slots shown to Students.

**Approach:**
1. `availability_rules` define the recurring weekly pattern (source of truth for "usual" availability).
2. A background job materializes concrete `slots` rows for a rolling window (e.g., next 30 days) whenever rules/exceptions change, rather than computing availability on-the-fly on every browse request — this trades a small amount of storage for much simpler, faster, and safer concurrency handling.
3. Booking a slot is a single DB transaction: `SELECT slot FOR UPDATE` → check `status = open` → set `status = held, held_until = now()+10min` → on payment success, `status = booked` and create the `booking` row; on payment timeout/failure, a background job reverts `held` slots past `held_until` back to `open`.
4. This guarantees no double-booking is possible even under high concurrent load, because the row lock serializes competing booking attempts on the same slot.

**Timezone handling:** all `slots.start_time`/`end_time` stored in UTC; Interviewer's rules stored with their own timezone and converted to UTC at materialization time; Student-facing display converts UTC → Student's browser-detected (or profile-set) timezone.

---

## 33. Calendar Architecture

- Integration: Google Calendar API (server-to-server, using a RoundIQ service account or per-interviewer OAuth grant — **recommendation: service-account-created events with both parties added as guests**, avoiding the complexity of requiring every Interviewer to grant calendar OAuth).
- On booking confirmation: create a Calendar Event with Google Meet conferencing auto-attached (`conferenceDataVersion: 1` in the Calendar API insert call), invite both Student and Interviewer emails, set reminders (matching RoundIQ's own notification schedule as a redundant layer).
- On cancellation: corresponding Calendar Event is deleted/updated, cancellation notice sent to both invitees automatically by Google Calendar's own invite-update mechanism.
- On reschedule: existing event updated in place (same Meet link reused) rather than deleted+recreated, to avoid confusion.
- Failure handling: if the Calendar API call fails, booking confirmation is **not** blocked — a retry job attempts Meet-link generation up to N times, and if all fail, Admin is alerted for manual intervention (a failed Meet link is a critical trust failure and needs a human fallback path, not a silent error).

---

## 34. Payment Architecture

**Gateway:** Razorpay (Orders API for collection, RazorpayX Payouts API for interviewer withdrawals).

**Escrow model (conceptual, not a regulated escrow account — implemented via internal ledger accounting):**
1. Student payment is captured in full by RoundIQ's Razorpay account.
2. Internally, the full amount is held as "platform-owed-to-interviewer" pending session completion — represented as a `pending_balance` on the Interviewer's wallet, **not yet withdrawable**.
3. Upon `Booking.status = COMPLETED` (feedback submitted, no open dispute), a scheduled/triggered job releases the commission portion to Platform Revenue and the remainder to the Interviewer's `available_balance`.
4. If a dispute is opened before release, the release is held until dispute resolution (Section 37).

**Reconciliation:** a nightly job compares Razorpay's settlement reports against internal `transactions` ledger totals to catch any drift (webhook misses, duplicate events, gateway-side reversals) — critical for financial integrity and required before any serious scale.

**PCI scope:** RoundIQ never stores card/UPI credentials; all sensitive payment collection happens in Razorpay-hosted UI/SDK components.

---

## 35. Commission System

- Commission is a **percentage of session price**, configurable via `platform_settings` (not hardcoded), allowing business-side commission changes without a deploy.
- **Recommended MVP structure:** flat commission tier (e.g., a flat X% for all interviewers) to keep the system simple and explainable at launch, with the schema already supporting **tiered commission by interviewer lifetime volume** (e.g., lower % after N completed sessions) as a documented but not-yet-activated V2 feature — this rewards loyalty without requiring a rebuild.
- Commission is calculated and locked in **at booking time** (stored on the `bookings` row as `commission_minor_units`) rather than recalculated at payout time, so historical bookings are unaffected by later commission-rate changes — an important auditability and trust property (an Interviewer's payout for a past session should never silently change).
- Commission is always transparently shown to the Interviewer on their earnings breakdown (gross price → commission deducted → net payout) — hidden fees are a top driver of marketplace distrust and churn.

---

## 36. Withdrawal System

- Interviewer's **Available Balance** = sum of net payouts from `COMPLETED` bookings that have passed the dispute window (recommended: 72 hours post-completion with no open dispute) minus prior withdrawals.
- Withdrawal request flow: Interviewer requests amount ≤ Available Balance → `WithdrawalRequest(status=pending)` → (MVP: manual Admin approval for the first cohort of withdrawals per interviewer as a fraud-control measure, transitioning to automated approval for interviewers with a clean history after a threshold, e.g., 5 clean withdrawals) → RazorpayX Payout API call → webhook confirms → status `completed`, ledger updated.
- **Minimum withdrawal amount** and **payout processing SLA** (e.g., 3–5 business days) configurable via `platform_settings` and clearly communicated in-product to set correct expectations.
- Failed payouts (bad bank details, etc.) revert the ledger and notify the Interviewer to correct payout details and resubmit.

---

## 37. Refund System

**Refund triggers:**
1. Interviewer rejects booking within the post-payment reject window → automatic full refund.
2. Confirmed no-show by Interviewer (verified via Admin review of both parties' reports/signals) → automatic or Admin-approved full refund to Student, and a reliability strike against the Interviewer.
3. Student no-show / late cancellation outside the free-cancellation window → per cancellation policy (Section 38), refund may be partial or none, with the Interviewer still compensated (since they held the slot in good faith).
4. Technical failure genuinely attributable to the platform (e.g., Meet link generation totally failed and no fallback was possible) → full refund, no fault to either party.
5. Quality dispute (Student unsatisfied with session quality, not a no-show) → **not** auto-refunded; routed to Admin dispute review, since "quality" is subjective and blanket quality-based refunds would create bad incentives for Students to claim dissatisfaction after receiving genuine value.

**Refund destination:** default to Student Wallet (faster, cheaper, no gateway refund fee) with an option for refund-to-original-payment-method for larger amounts or on request, processed via Razorpay's Refund API.

**Refund vs. Interviewer payout interaction:** a refund to the Student always reverses/withholds the corresponding Interviewer payout for that specific booking unless the refund reason is "platform fault" (case 4 above), in which case the Interviewer may still be compensated from platform funds if they conducted the session in good faith — this nuance should be explicitly encoded in the dispute-resolution admin UI as distinct resolution types, not left to ad hoc judgment.


---

## 38. Edge Cases

| Edge Case | Handling |
|---|---|
| Two students try to book the same slot simultaneously | DB row-lock on slot ensures only one succeeds; other sees real-time "slot taken" error, no charge |
| Payment captured by gateway but webhook delayed/lost | Reconciliation job cross-checks Razorpay settlement report vs. internal orders nightly; a manual "resync order" admin action exists for the interim |
| Interviewer accepts, then has a genuine emergency before session | Reject-with-cause within policy window (or Admin-mediated late cancellation) → full refund to Student, no penalty to Interviewer if legitimate and infrequent; repeated late cancellations trigger a reliability strike / reduced search ranking |
| Student joins Meet link, Interviewer never joins | Student can flag no-show from booking detail screen with a one-tap report; Admin reviews (calendar join logs if available, or good-faith review after pattern-checking Interviewer's history) → refund + strike |
| Interviewer joins, Student never joins | Interviewer can flag Student no-show; per policy, Interviewer is still compensated (they held the slot and showed up), Student is not refunded, and repeat Student no-shows may lead to booking restrictions (e.g., prepayment-only, or eventual suspension) |
| Both parties join late but complete a shortened session | Session still counted as completed if feedback is submitted in good faith; Admin can adjust in genuinely problematic cases via dispute flow |
| Interviewer never submits feedback | Escalating reminders → auto-escalation to Admin after 72h → Admin can manually request feedback, extend deadline, or (in abuse cases) withhold/reverse the Interviewer's payout for that booking |
| Interviewer sets unrealistic pricing (extremely high or near-zero) | Admin-configured min/max price bounds per category enforced at pricing-save time |
| Student attempts to book with insufficient wallet + failed card | Booking is not created until payment is fully confirmed; no partial-state booking ever exists |
| Refund issued but Interviewer already withdrew related funds | Ledger allows Interviewer wallet to go negative in this rare case (rather than blocking the refund), with the negative balance offset against future earnings; large/abusive negative balances flagged for Admin/legal follow-up |
| Interviewer account suspended mid-way through having active future bookings | All future bookings for that Interviewer auto-flagged; affected Students notified and offered full refund or rebooking assistance; Admin dashboard surfaces this as a priority queue |
| Category becomes deprecated | Existing bookings unaffected; interviewer/category combination hidden from new discovery, not retroactively altered |
| Duplicate webhook delivery from Razorpay | Idempotency enforced via unique constraint on `razorpay_event_id` processed-log table |
| Student tries to review a session they didn't complete/pay for | Review submission endpoint validates `booking.status = completed AND booking.student_id = current_user` server-side — UI-level restriction is not trusted alone |
| Clock skew / slot shown as "available" but has just passed | Slot materialization job runs frequently (e.g., every few minutes) and booking creation re-validates `start_time > now()` server-side before confirming |

---

## 39. Error Handling

**Principles:** every error returned to the client is machine-readable (`code`) and human-readable (`message`), never a raw stack trace or DB error leaked to the frontend. Payment and booking errors are the highest-priority category given financial/trust stakes.

**Representative error codes:**
| HTTP Status | Code | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Request payload failed schema validation |
| 401 | `UNAUTHENTICATED` | Missing/invalid/expired token |
| 403 | `FORBIDDEN` | Authenticated but not authorized for this resource |
| 404 | `NOT_FOUND` | Resource doesn't exist or is not visible to this user |
| 409 | `SLOT_UNAVAILABLE` | Slot was booked/held by another party first |
| 409 | `DUPLICATE_REQUEST` | Idempotency key already processed with a different payload |
| 422 | `PRICING_OUT_OF_BOUNDS` | Interviewer-set price outside admin-configured min/max |
| 402 | `PAYMENT_FAILED` | Gateway declined/failed the payment |
| 423 | `RESOURCE_LOCKED` | Slot currently held by another in-progress checkout |
| 429 | `RATE_LIMITED` | Too many requests (auth, booking-attempt, or withdrawal endpoints) |
| 500 | `INTERNAL_ERROR` | Unhandled server error — logged with a correlation ID returned to the client for support reference |
| 503 | `DEPENDENCY_UNAVAILABLE` | Downstream dependency (Razorpay, Google Calendar) unavailable — triggers retry/fallback logic where applicable |

**Client-facing UX principle:** payment and booking errors always state clearly whether the Student **was or was not charged**, since ambiguity here is the single biggest source of support tickets and distrust in payment UX.

---

## 40. Dashboard Requirements

**Student Dashboard:** upcoming sessions (with join links/countdown), quick "book again" shortcuts to previously used interviewers/categories, wallet balance summary, latest feedback report highlight, notification bell.

**Interviewer Dashboard:** pending booking-response items (if any reject-window actions needed), upcoming sessions, this-month earnings summary (gross/commission/net), average rating trend, pending feedback-submission reminders, quick links to availability/pricing settings.

**Admin Dashboard:** platform health KPIs (bookings today/this week, GMV, active disputes count, pending verifications count, payment success rate, notification delivery health), quick-access queues (Verifications, Disputes, Withdrawals-pending-approval), and a global search bar (user/booking/transaction lookup).

---

## 41. Admin Panel Requirements

- **User Management:** search/filter by role/status, view full profile + history, suspend/ban/reinstate with mandatory reason logging.
- **Interviewer Verification Queue:** filterable by status/category/submission date, side-by-side document/profile review UI, approve/reject/request-info actions with templated + custom reason messaging.
- **Booking Management:** full booking list/search with status filters, detail drill-down showing full lifecycle timeline (created → paid → confirmed → completed/cancelled), manual override actions reserved for `super_admin` (e.g., force-cancel with refund).
- **Payments & Commission Overview:** transaction ledger viewer, daily/weekly GMV and commission-revenue charts, reconciliation status indicator (matched vs. drifted against gateway settlement).
- **Refunds & Disputes:** queue with SLA timers (visually flagging disputes approaching/past the 48-hour resolution target), full evidence view, resolution action buttons that trigger ledger updates automatically.
- **Categories Management:** CRUD for categories, ability to set per-category min/max pricing bounds.
- **Reports & Analytics:** exportable reports (CSV) for finance/ops use — bookings, payouts, commission revenue, refund summary, by date range.
- **Audit & Activity Logs:** searchable, filterable by actor/entity/date, immutable.
- **Platform Settings:** commission tier config, cancellation policy parameters, feedback deadline windows, withdrawal minimums/SLA — all editable by `super_admin` only, changes logged.

---

## 42. Security Requirements

- **Authentication:** JWT (short-lived access + rotating refresh tokens), see Section 29.
- **Authorization:** RBAC enforced server-side on every endpoint, resource-ownership checks in addition to role checks (see Section 30).
- **Rate limiting:** per-IP and per-account limits on auth, booking-attempt, and withdrawal-request endpoints (these are the highest-abuse-risk surfaces).
- **Input validation:** strict schema validation (e.g., Zod/Joi) on every API input, rejecting unexpected fields.
- **Encryption:** TLS 1.2+ in transit everywhere; sensitive PII (resume URLs, documents) stored in access-controlled object storage (S3/R2 with signed, time-limited URLs — never public buckets); passwords hashed with bcrypt/argon2; secrets in a managed secret store (AWS Secrets Manager or equivalent), never in source control.
- **CSRF protection:** SameSite cookie attributes + CSRF tokens for any cookie-based session flows (if cookies are used alongside/instead of bearer tokens for web sessions).
- **Webhook security:** all inbound webhooks (Razorpay) verified via HMAC signature check before processing; replayed/invalid-signature webhooks rejected and logged.
- **Audit logs:** immutable logging of all state-changing actions on financial and account-status entities, with actor/timestamp/before-after state (see Section 27, `audit_logs`).
- **Fraud detection considerations (documented for V2, not full build in MVP):** velocity checks on new-account booking patterns, flag interviewer-student pairs with suspiciously repeated fast "completed" sessions with no real engagement pattern (potential wash-trading of commission — e.g., collusive fake sessions to launder or extract value), device/IP fingerprint checks on withdrawal requests.
- **Least privilege:** admin permission levels (`support_agent` < `ops_admin` < `super_admin`) restrict access to financial-config and destructive actions to the smallest necessary group.
- **Dependency & infra hardening:** regular dependency vulnerability scanning (e.g., GitHub Dependabot), WAF in front of the public API (e.g., Cloudflare), DDoS protection via Cloudflare.

---

## 43. Logging Requirements

- **Structured logging:** all application logs emitted as structured JSON (not free-text) with consistent fields: `timestamp`, `level`, `service`, `request_id`, `user_id (if applicable)`, `message`, `metadata`.
- **Correlation IDs:** every incoming request assigned a `request_id` propagated through all downstream service calls and included in error responses for support traceability.
- **Log levels:** `debug` (dev only), `info` (normal operational events), `warn` (recoverable anomalies), `error` (failures needing attention), `critical` (payment/security incidents, paged to on-call).
- **Retention:** application logs retained 30–90 days in hot storage (searchable), audit logs retained indefinitely (or per applicable legal/regulatory retention requirement) in cold/archival storage.
- **Sensitive data handling:** PII and payment details never logged in plaintext; logs are redacted/masked for fields like email (partially), phone, and any payment identifiers beyond the last 4 digits.
- **Centralization:** logs shipped to a centralized platform (e.g., CloudWatch, Datadog, or self-hosted ELK) rather than left on individual instances, enabling cross-service search during incident investigation.

---

## 44. Analytics Requirements

**Product analytics (behavioral):** funnel tracking for signup → first booking, browse → profile-view → booking conversion, session-completion rate, repeat-booking rate — implemented via an event-tracking layer (e.g., Segment/PostHog/Amplitude) emitting events like `interviewer_profile_viewed`, `booking_checkout_started`, `booking_confirmed`, `feedback_submitted`, `review_submitted`.

**Business analytics (financial/operational):** GMV, commission revenue, take-rate realized, refund rate, average session price by category, interviewer earnings distribution, cohort retention (Student and Interviewer separately) — surfaced in the Admin Reports section (Section 41) and exportable for finance.

**Interviewer-facing analytics:** sessions conducted (trend over time), average rating trend, category breakdown of sessions, repeat-student percentage, earnings trend — designed specifically to reinforce the "this is worth my time" retention loop identified in Section 10.2.

**Student-facing analytics (lightweight in MVP, foundation for future Interview Passport):** sessions completed by category, rating trend across sessions in the same category (are they improving?), most common feedback themes across their own sessions.


---

## 45. Product Backlog (MVP Scope, Prioritized)

**P0 — Must-have for launch (nothing ships without these):**
1. Auth (email/password + Google OAuth), role selection, email verification
2. Interviewer application + Admin verification queue
3. Interviewer availability calendar + pricing setup
4. Student browse/search/filter + interviewer profile view
5. Slot booking with race-condition-safe locking
6. Razorpay payment integration (Orders API + webhook handling)
7. Google Calendar/Meet link auto-generation
8. Booking lifecycle state machine (all statuses in Section 27)
9. Structured feedback submission (Interviewer)
10. Rating + review submission (Student)
11. Wallet ledger (both types) + transaction system
12. Withdrawal request flow (manual-approval MVP version)
13. Refund flow (policy-triggered + Admin-mediated)
14. Notification system (email, core transactional set)
15. Admin panel: verification queue, booking management, refunds/disputes, basic reporting
16. Core security (RBAC, rate limiting, input validation, audit logs)

**P1 — Important, can trail P0 by a few weeks post-launch:**
17. In-app (browser) notifications, not just email
18. Interviewer analytics dashboard depth
19. Reschedule flow (vs. cancel-and-rebook only)
20. Admin reporting exports (CSV)
21. Automated withdrawal approval for trusted interviewers

**P2 — Nice-to-have, explicitly deferred:**
22. Featured interviewer placements
23. Resume review as a session type
24. Referral system
25. SMS/WhatsApp notification channel

---

## 46. Epics

- **EPIC-1: Identity & Access** — auth, roles, verification.
- **EPIC-2: Interviewer Supply Tools** — profile, pricing, availability.
- **EPIC-3: Discovery & Search** — browse, filter, profile view.
- **EPIC-4: Booking & Scheduling Engine** — slot locking, booking lifecycle.
- **EPIC-5: Payments & Ledger** — Razorpay integration, wallet, commission.
- **EPIC-6: Interview Session Lifecycle** — Meet integration, feedback, reviews.
- **EPIC-7: Trust & Operations** — disputes, refunds, cancellation policy enforcement.
- **EPIC-8: Notifications** — transactional email/in-app system.
- **EPIC-9: Admin Control Plane** — all admin panel capabilities.
- **EPIC-10: Platform Foundations** — security, logging, analytics, DevOps.

---

## 47. Features

Mapped 1:1 to the Functional Requirements in Section 13 — each `FR-x.y` is treated as a discrete, independently-testable feature for backlog grooming purposes, grouped under its parent Epic (e.g., all `FR-2.x` Student features live under EPIC-3/4/6 depending on the specific capability).

---

## 48. Stories

Story-level breakdown follows the standard pattern shown in Section 15 (User Stories) and Section 16 (Acceptance Criteria) — each Feature above should be decomposed into 3–8 implementation-sized stories during sprint planning (e.g., "Slot booking" decomposes into: slot materialization job, slot-hold-on-checkout-start, slot-release-on-timeout, booking-creation-on-payment-webhook, double-booking race-condition test suite).

---

## 49. Sprint Planning (Illustrative 2-Week Sprints, MVP Build)

| Sprint | Focus |
|---|---|
| 1 | Project scaffolding, CI/CD, DB schema migration setup, Auth (signup/login/OAuth) |
| 2 | Interviewer application flow + Admin verification queue (basic) |
| 3 | Availability calendar (rules + exceptions + materialization job) |
| 4 | Pricing settings + Categories management + public browse/search |
| 5 | Slot locking + booking creation logic (pre-payment) |
| 6 | Razorpay integration (Orders API, webhook handling, idempotency) |
| 7 | Google Calendar/Meet integration + booking confirmation flow end-to-end |
| 8 | Wallet/ledger system + commission calculation |
| 9 | Feedback submission + review submission flows |
| 10 | Notification system (transactional email set) |
| 11 | Cancellation policy + refund flow + dispute queue (Admin) |
| 12 | Withdrawal flow (manual approval) + RazorpayX integration |
| 13 | Admin panel completion (user mgmt, reporting, audit logs) |
| 14 | Security hardening pass, rate limiting, load testing |
| 15 | QA pass (full checklist, Section 54), bug fixing |
| 16 | Staging soak test, production deployment, launch readiness review |

*(16 sprints ≈ 8 months for a small founding engineering team of 3–5; can compress with a larger team — this plan is intentionally sequenced so the payment/booking core is proven before peripheral features are built.)*

---

## 50. MVP Roadmap

**Phase 0 (Pre-launch, ~8 sprints as above):** Full MVP feature set per Section 45 P0 list, India-only, Razorpay-only, web-only (responsive, no native app), Google Meet only, manual-approval withdrawals, email-only notifications.

**Phase 1 (Launch, Month 0):** Soft launch to a small, hand-recruited interviewer cohort (30–50 verified interviewers across the highest-demand categories: DSA, System Design, Frontend/React, Backend) and a targeted student acquisition push (college partnerships, targeted content/social).

**Phase 2 (Month 1–3):** Iterate on conversion funnel based on real usage data, introduce reschedule flow, in-app notifications, deepen interviewer analytics, begin automating withdrawal approval for trusted interviewers.

**Phase 3 (Month 3–6):** Expand category depth, introduce Resume Review as a second session type (proves the platform generalizes beyond "interview" as a category), begin featured-placement monetization experiments.

---

## 51. Version 2 Roadmap (Month 6–12)

- Tiered commission by interviewer lifetime volume (schema already supports this per Section 35).
- Automated withdrawal approval at scale with fraud-detection velocity checks.
- Reschedule and multi-slot "package" bookings (e.g., buy 3 sessions at a discount).
- Referral program (Student-refers-Student, Interviewer-refers-Interviewer).
- SMS/WhatsApp notification channel.
- College/university partnership portal (bulk credits, cohort management, placement-cell dashboards).
- Interview Passport v1 — a portable, verified summary of a Student's completed sessions and feedback trends, shareable as a profile link.
- Expanded feedback rubrics per category (System Design feedback should look structurally different from Behavioral/HR feedback).
- Native mobile apps (iOS/Android) if usage data shows strong mobile session-booking demand.

---

## 52. Version 3 Roadmap (Year 2+)

- **AI as an assistive layer only** (never replacing the human interview): AI-assisted feedback summarization for Interviewers (drafts a structured report from their raw notes, Interviewer edits/approves — human stays in the loop), AI-powered interviewer-student matching recommendations, AI resume screening to pre-fill profile data.
- Company Hiring / Recruiter Marketplace — companies source shortlists from top Interview-Passport-scored candidates (with explicit Student opt-in/consent).
- Enterprise Plans for bootcamps/companies (bulk seats, dedicated account management).
- Live collaborative coding editor + whiteboard as an **optional enhancement layer** on top of Google Meet (not a replacement for human conduct) for categories like DSA/System Design where a shared canvas materially improves the interview experience.
- Optional session recording (with explicit dual consent) for Students who want to review their own performance — carefully scoped given privacy/consent complexity.
- Geographic expansion beyond India (Stripe integration, multi-currency, localization).
- Subscriptions (e.g., monthly credit bundles) as an alternative to pure pay-per-session, if usage data shows demand for a lower-commitment recurring model.

---

## 53. Testing Strategy

**Unit tests:** all business logic — commission calculation, slot-locking logic, refund-eligibility rules, cancellation-policy calculations — covered with unit tests given their direct financial impact; target >85% coverage on the payments/booking/wallet modules specifically (not a blanket repo-wide vanity metric).

**Integration tests:** full API endpoint tests against a real (test-environment) database, including Razorpay's sandbox/test-mode for payment flows and webhook simulation.

**Concurrency/race-condition tests:** dedicated test suite that fires concurrent booking requests at the same slot to verify the DB-level locking guarantee holds (this is the single highest-value test suite in the entire product given the double-booking risk).

**End-to-end tests:** Cypress/Playwright suites covering the full happy-path Booking Flow (Section 18) and Interview Flow (Section 21) from both Student and Interviewer perspectives, plus key negative paths (payment failure, slot conflict, feedback deadline miss).

**Load testing:** simulate peak booking-window traffic (e.g., evening hours when most bookings cluster) against staging to validate P95 latency targets from Section 14 before launch.

**Security testing:** dependency vulnerability scanning in CI, periodic manual penetration testing pass before major launches, webhook signature-forgery test cases.

**Manual QA:** full regression pass against the QA Checklist (Section 54) before each production release, especially any release touching payment/booking/wallet code paths.

---

## 54. QA Checklist (Representative, Pre-Launch)

- [ ] Signup/login works via email and Google OAuth; email verification enforced before booking.
- [ ] Interviewer application → verification → activation flow works end-to-end with all three admin decisions (approve/reject/request-info).
- [ ] Availability calendar correctly generates bookable slots respecting timezone conversion.
- [ ] Two simultaneous booking attempts on the same slot: exactly one succeeds, no double charge.
- [ ] Full payment flow succeeds with Razorpay test cards/UPI in sandbox; webhook correctly confirms booking.
- [ ] Payment failure correctly releases the slot hold and shows a clear error with no charge.
- [ ] Google Meet link is generated and visible to both parties immediately on confirmation.
- [ ] Reminder notifications fire at 24h and 1h before session.
- [ ] Feedback form is required and correctly blocks/reminds if not submitted within the deadline window.
- [ ] Review can only be submitted for a genuinely completed, paid booking by the correct Student.
- [ ] Wallet balances update correctly across booking payment, refund, commission capture, and payout release.
- [ ] Withdrawal request → admin approval → RazorpayX payout → wallet debit all reconcile correctly.
- [ ] Refund flow correctly reverses/withholds the corresponding interviewer payout.
- [ ] Cancellation policy correctly computes partial/full refund based on timing.
- [ ] Admin panel: verification queue, dispute queue, booking search, and audit logs all function correctly with correct RBAC restrictions per role.
- [ ] All monetary values display correctly formatted (no floating-point rounding artifacts).
- [ ] Rate limiting correctly triggers on repeated auth/booking-attempt abuse in staging load test.
- [ ] All emails render correctly across major email clients (Gmail, Outlook) and contain correct dynamic data.


---

## 55. Deployment Strategy

- **Environments:** `local` → `staging` → `production`, with staging as a true production mirror (same infra shape, Razorpay in test mode, seeded realistic data) used for pre-release QA and load testing.
- **Release process:** trunk-based development with short-lived feature branches, PR review required, CI must pass (lint, unit tests, integration tests) before merge; automated deploy to staging on merge to `main`, manual-gated promotion to production.
- **Rollback:** every production deploy is a tagged, immutable container image; rollback is a redeploy of the previous tag, not a code revert-and-rebuild, to keep rollback time minimal during incidents.
- **Database migrations:** versioned, forward-only migrations (e.g., via Prisma Migrate/Knex/Flyway) run as a distinct pre-deploy step with a documented rollback migration for every change touching financial tables.
- **Feature flags:** used for any risky or partially-rolled-out feature (e.g., automated withdrawal approval rollout) to allow instant disable without a redeploy.

---

## 56. DevOps Architecture

```
                        ┌──────────────┐
                        │  Cloudflare  │  (DNS, CDN, WAF, DDoS protection)
                        └──────┬───────┘
                               │
                        ┌──────▼───────┐
                        │    Nginx     │  (reverse proxy, TLS termination)
                        └──────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                 │
      ┌───────▼──────┐ ┌───────▼──────┐  ┌───────▼──────┐
      │ Next.js App  │ │ Node/Express │  │ Notification │
      │ (Frontend/SSR)│ │  API Server  │  │    Worker    │
      └───────────────┘ └───────┬──────┘  └───────┬──────┘
                                 │                  │
                     ┌───────────┼──────────────────┘
                     │           │
             ┌───────▼───┐ ┌─────▼─────┐      ┌─────────────┐
             │ PostgreSQL│ │   Redis   │      │  Cloudflare │
             │ (primary) │ │ (cache/   │      │  R2 / S3    │
             │           │ │  queue)   │      │  (storage)  │
             └───────────┘ └───────────┘      └─────────────┘

    External integrations: Razorpay (Orders + RazorpayX Payouts + Webhooks),
    Google Calendar/Meet API, Email provider (SES/Postmark/SendGrid)

    CI/CD: GitHub Actions (lint → test → build → deploy to staging → manual
    promote to production), Docker images per service, deployed on AWS
    (ECS/EC2 or equivalent), infra-as-code (Terraform) recommended from day one.
```

- **Containerization:** all services (frontend, API, worker) run as Docker containers, orchestrated via ECS (simplest path to production for a small team) with a documented upgrade path to Kubernetes if/when operational complexity justifies it.
- **Monitoring/alerting:** uptime and latency monitoring (e.g., a synthetic check on the booking flow specifically, not just a generic health endpoint), error tracking (Sentry), payment-failure-rate alerting piped to an on-call channel given its criticality.
- **Backups:** automated daily PostgreSQL backups with point-in-time recovery enabled, tested restore procedure documented and periodically rehearsed.

---

## 57. Folder Structure

```
roundiq/
├── apps/
│   ├── web/                       # Next.js frontend (Student/Interviewer/Admin UIs)
│   │   ├── app/
│   │   │   ├── (public)/
│   │   │   ├── student/
│   │   │   ├── interviewer/
│   │   │   ├── admin/
│   │   │   └── api/                # (if using Next.js route handlers for BFF needs)
│   │   ├── components/
│   │   ├── lib/
│   │   ├── hooks/
│   │   └── styles/
│   │
│   ├── api/                        # Node/Express API server
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── interviewers/
│   │   │   │   ├── students/
│   │   │   │   ├── categories/
│   │   │   │   ├── availability/
│   │   │   │   ├── bookings/
│   │   │   │   ├── payments/
│   │   │   │   ├── wallets/
│   │   │   │   ├── feedback/
│   │   │   │   ├── reviews/
│   │   │   │   ├── withdrawals/
│   │   │   │   ├── disputes/
│   │   │   │   ├── notifications/
│   │   │   │   └── admin/
│   │   │   ├── middleware/         # auth, rbac, rate-limit, error-handler
│   │   │   ├── integrations/       # razorpay/, google-calendar/, email/
│   │   │   ├── jobs/                # slot-materialization, payout-release, reminders
│   │   │   ├── db/                  # migrations, models/schema
│   │   │   └── utils/
│   │   └── tests/
│   │
│   └── worker/                     # notification + background job worker
│       └── src/
│
├── packages/
│   ├── shared-types/                # shared TypeScript types/DTOs across apps
│   ├── validation-schemas/          # shared Zod schemas
│   └── ui-components/               # shared design system components
│
├── infra/
│   ├── terraform/
│   ├── docker/
│   └── nginx/
│
├── .github/workflows/               # CI/CD pipelines
├── docs/                            # this document + supplementary specs
└── README.md
```

---

## 58. Database Schema (SQL, Core Tables)

```sql
-- Users & Roles
CREATE TYPE user_role AS ENUM ('student', 'interviewer', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    role user_role NOT NULL,
    status user_status NOT NULL DEFAULT 'active',
    email_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE interviewer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    full_name VARCHAR(255) NOT NULL,
    bio TEXT,
    current_company VARCHAR(255),
    current_title VARCHAR(255),
    years_experience INT,
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    resume_url VARCHAR(500),
    timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
    verification_status VARCHAR(32) NOT NULL DEFAULT 'submitted',
    average_rating NUMERIC(3,2) DEFAULT 0,
    total_sessions_completed INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    description TEXT
);

CREATE TABLE interviewer_category_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interviewer_id UUID NOT NULL REFERENCES interviewer_profiles(id),
    category_id UUID NOT NULL REFERENCES categories(id),
    duration_minutes INT NOT NULL CHECK (duration_minutes IN (30,45,60,90)),
    price_minor_units INT NOT NULL CHECK (price_minor_units > 0),
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    is_active BOOLEAN NOT NULL DEFAULT true,
    UNIQUE (interviewer_id, category_id, duration_minutes)
);

CREATE TABLE slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interviewer_id UUID NOT NULL REFERENCES interviewer_profiles(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'open',
    held_until TIMESTAMPTZ,
    UNIQUE (interviewer_id, start_time)
);

CREATE TYPE booking_status AS ENUM (
    'pending_payment', 'confirmed', 'interviewer_rejected',
    'cancelled_by_student', 'cancelled_by_interviewer',
    'no_show_student', 'no_show_interviewer', 'completed', 'disputed'
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    interviewer_id UUID NOT NULL REFERENCES interviewer_profiles(id),
    slot_id UUID NOT NULL REFERENCES slots(id),
    category_id UUID NOT NULL REFERENCES categories(id),
    duration_minutes INT NOT NULL,
    price_minor_units INT NOT NULL,
    commission_minor_units INT NOT NULL,
    interviewer_payout_minor_units INT NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending_payment',
    meet_link VARCHAR(500),
    student_prep_notes TEXT,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    razorpay_order_id VARCHAR(128) UNIQUE,
    amount_minor_units INT NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    status VARCHAR(16) NOT NULL DEFAULT 'created',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    wallet_type VARCHAR(16) NOT NULL,
    available_balance_minor_units BIGINT NOT NULL DEFAULT 0,
    pending_balance_minor_units BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, wallet_type)
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES wallets(id),
    booking_id UUID REFERENCES bookings(id),
    type VARCHAR(32) NOT NULL,
    amount_minor_units BIGINT NOT NULL,
    direction VARCHAR(8) NOT NULL CHECK (direction IN ('credit','debit')),
    balance_after_minor_units BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB
);

CREATE TABLE feedback_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id),
    technical_skills_rating INT CHECK (technical_skills_rating BETWEEN 1 AND 5),
    technical_skills_notes TEXT,
    problem_solving_rating INT CHECK (problem_solving_rating BETWEEN 1 AND 5),
    problem_solving_notes TEXT,
    communication_rating INT CHECK (communication_rating BETWEEN 1 AND 5),
    communication_notes TEXT,
    strengths TEXT,
    weaknesses TEXT,
    improvement_suggestions TEXT,
    overall_recommendation VARCHAR(32),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id),
    student_id UUID NOT NULL REFERENCES users(id),
    interviewer_id UUID NOT NULL REFERENCES interviewer_profiles(id),
    communication_rating INT CHECK (communication_rating BETWEEN 1 AND 5),
    technical_knowledge_rating INT CHECK (technical_knowledge_rating BETWEEN 1 AND 5),
    professionalism_rating INT CHECK (professionalism_rating BETWEEN 1 AND 5),
    helpfulness_rating INT CHECK (helpfulness_rating BETWEEN 1 AND 5),
    overall_rating INT CHECK (overall_rating BETWEEN 1 AND 5),
    written_review TEXT,
    is_flagged BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interviewer_id UUID NOT NULL REFERENCES interviewer_profiles(id),
    amount_minor_units BIGINT NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'pending',
    payout_method VARCHAR(16) NOT NULL,
    razorpayx_payout_id VARCHAR(128),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ
);

CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    raised_by UUID NOT NULL REFERENCES users(id),
    type VARCHAR(32) NOT NULL,
    description TEXT,
    status VARCHAR(16) NOT NULL DEFAULT 'open',
    resolution_type VARCHAR(32),
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID,
    actor_type VARCHAR(16) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id UUID,
    before_state JSONB,
    after_state JSONB,
    ip_address VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

*(Full schema also includes `student_profiles`, `interviewer_verifications`, `availability_rules`, `availability_exceptions`, `payments`, `refunds`, `notifications`, `admin_users`, `platform_settings` per Section 27's entity definitions — omitted here for brevity but structurally identical in style/rigor to the above.)*


---

## 59. REST API Endpoints (Full Reference)

**Auth**
```
POST   /api/v1/auth/signup
POST   /api/v1/auth/login
POST   /api/v1/auth/google
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
```

**Users / Profiles**
```
GET    /api/v1/users/me
PATCH  /api/v1/users/me
GET    /api/v1/students/me/profile
PATCH  /api/v1/students/me/profile
POST   /api/v1/students/me/resume
GET    /api/v1/interviewers/me/profile
PATCH  /api/v1/interviewers/me/profile
POST   /api/v1/interviewers/apply
GET    /api/v1/interviewers/me/verification-status
```

**Discovery**
```
GET    /api/v1/interviewers                 # search/filter: category, price range, rating, company, availability
GET    /api/v1/interviewers/:id
GET    /api/v1/categories
```

**Availability & Pricing**
```
GET    /api/v1/interviewers/me/availability-rules
POST   /api/v1/interviewers/me/availability-rules
PATCH  /api/v1/interviewers/me/availability-rules/:id
DELETE /api/v1/interviewers/me/availability-rules/:id
POST   /api/v1/interviewers/me/availability-exceptions
GET    /api/v1/interviewers/:id/slots?from=&to=      # public: bookable slots for a given interviewer
GET    /api/v1/interviewers/me/pricing
PUT    /api/v1/interviewers/me/pricing
```

**Bookings**
```
POST   /api/v1/bookings/hold                # soft-lock a slot, returns hold token + expiry
POST   /api/v1/bookings                     # create booking (post-payment confirmation)
GET    /api/v1/bookings                     # list current user's bookings (role-scoped)
GET    /api/v1/bookings/:id
POST   /api/v1/bookings/:id/reject          # interviewer reject-with-cause
POST   /api/v1/bookings/:id/cancel          # student or interviewer cancel per policy
POST   /api/v1/bookings/:id/reschedule
```

**Payments**
```
POST   /api/v1/payments/orders              # create Razorpay order for a held booking
POST   /api/v1/webhooks/razorpay             # signature-verified webhook receiver
GET    /api/v1/payments/:orderId/status
```

**Wallet & Withdrawals**
```
GET    /api/v1/wallet/me
GET    /api/v1/wallet/me/transactions
POST   /api/v1/withdrawals                   # interviewer requests withdrawal
GET    /api/v1/withdrawals/me
GET    /api/v1/withdrawals/:id
```

**Feedback & Reviews**
```
POST   /api/v1/bookings/:id/feedback         # interviewer submits structured feedback
GET    /api/v1/bookings/:id/feedback
POST   /api/v1/bookings/:id/review           # student submits rating + review
GET    /api/v1/interviewers/:id/reviews
```

**Disputes**
```
POST   /api/v1/disputes                      # raise a dispute on a booking
GET    /api/v1/disputes/me
GET    /api/v1/disputes/:id
```

**Notifications**
```
GET    /api/v1/notifications
PATCH  /api/v1/notifications/:id/read
PATCH  /api/v1/notifications/read-all
```

**Admin**
```
GET    /api/v1/admin/verifications
POST   /api/v1/admin/verifications/:id/approve
POST   /api/v1/admin/verifications/:id/reject
POST   /api/v1/admin/verifications/:id/request-info
GET    /api/v1/admin/users
PATCH  /api/v1/admin/users/:id/status
GET    /api/v1/admin/bookings
POST   /api/v1/admin/bookings/:id/override
GET    /api/v1/admin/disputes
POST   /api/v1/admin/disputes/:id/resolve
GET    /api/v1/admin/withdrawals
POST   /api/v1/admin/withdrawals/:id/approve
GET    /api/v1/admin/transactions
GET    /api/v1/admin/reports/gmv
GET    /api/v1/admin/reports/commission
GET    /api/v1/admin/audit-logs
GET    /api/v1/admin/settings
PUT    /api/v1/admin/settings
```

Every mutating endpoint above requires a valid access token; ownership/role checks are enforced server-side per the Authorization Matrix in Section 30, and booking/payment-critical POST endpoints require an `Idempotency-Key` header.

---

## 60. Future Scaling Strategy

**Database scaling:** introduce PostgreSQL read replicas once read QPS (primarily browse/search) exceeds single-instance headroom; consider a dedicated search index (e.g., OpenSearch/Elasticsearch or even a simpler Postgres full-text/trigram index first) once interviewer catalog size and filter complexity outgrow simple SQL `WHERE` filtering.

**Caching:** Redis caching layer for hot read paths (interviewer profile pages, category listings, popular search filter combinations) with short TTLs and explicit invalidation on writes (e.g., pricing/availability change invalidates that interviewer's cached profile).

**Service decomposition:** MVP is a modular monolith (single API service, cleanly separated modules per Section 57's folder structure) by design — this is the right choice for a small team's velocity. Decomposition into separate services (e.g., a dedicated Payments/Ledger service, a dedicated Scheduling service) should only happen once team size and independent-deploy-cadence needs justify the added operational complexity, not preemptively.

**Async/queue scaling:** background job processing (notifications, slot materialization, payout release, reminder scheduling) already runs on a queue (Redis/BullMQ) from MVP, which horizontally scales by simply adding more worker instances — no architectural change needed as volume grows.

**Geographic/multi-currency scaling:** currency and timezone handling are already abstracted from day one (Section 14), so adding Stripe alongside Razorpay for non-India markets is additive, not a rewrite — implemented as a `PaymentProvider` interface with Razorpay as the first concrete implementation.

**Traffic scaling:** stateless API layer behind a load balancer scales horizontally; session/auth state lives in JWT + Redis (not in-process memory), so any instance can serve any request — a prerequisite for horizontal scaling that's built in from MVP rather than retrofitted.

**Cost scaling:** as GMV grows, payment gateway fees and payout fees become a material cost line — monitor blended take-rate net of these fees (not just gross commission %) as a true unit-economics metric from early on.

---

## 61. Product Risks

| Risk | Category | Mitigation |
|---|---|---|
| Supply-side cold start — not enough quality interviewers at launch to serve demand | Marketplace | Hand-recruit founding cohort of 30–50 interviewers before public demand-side launch; concentrate initial marketing on a narrow set of high-demand categories rather than spreading thin |
| Demand-side cold start — not enough students discovering/trusting the platform | Marketplace | College partnership channel + high-trust content marketing (real interviewer credentials visible pre-signup) |
| Two-sided trust collapse from a few bad experiences (no-shows, poor feedback quality) going viral on social media | Trust/Brand | Strict verification, enforced feedback deadlines, visible reliability strikes, fast (48h) dispute resolution SLA |
| Payment/regulatory risk — wallet model inadvertently triggering RBI PPI-license requirements in India | Legal/Regulatory | Legal review of the wallet design before launch (Section 20's "no cash-out for Students" constraint is a mitigation, not a guarantee — validate explicitly) |
| Interviewers and Students colluding to transact off-platform to avoid commission ("disintermediation") | Marketplace/Revenue | Keep meaningful value (verification badge, dispute protection, structured feedback tooling, discoverability) inside the platform so off-platform transacting loses real value, not just convenience |
| Fake/wash-trading sessions to extract commission-adjacent value or launder funds | Fraud | Velocity/pattern monitoring on repeat interviewer-student pairs (V2 fraud detection per Section 42) |
| Interviewer quality inconsistency damaging the "real interview" value proposition | Product Quality | Rigorous initial verification + ongoing rating-based quality gating (e.g., interviewers below a rating threshold get reduced search visibility or re-review) |
| Key-person/single-admin operational bottleneck for verification and disputes at scale | Operational | Admin panel designed for queue-based, SLA-tracked workflows from MVP so additional ops hires can onboard quickly as volume grows |
| Google Meet/Calendar API dependency risk (outage, quota limits, policy change) | Technical | Documented fallback (manual meeting-link entry by Admin) for Calendar API outages; monitor Google API quota usage against tier limits |
| Razorpay dependency risk (outage, account restriction) | Technical/Financial | Architecture reserves a `PaymentProvider` abstraction (Section 60) allowing a second gateway to be added if needed |

---

## 62. Assumptions

1. India is the sole initial market; pricing, payments, and legal considerations are scoped to Indian regulations (Razorpay, INR, DPDP Act) for MVP.
2. Google Meet is an acceptable, sufficiently reliable meeting tool for the target audience (no custom video infrastructure needed at MVP scale).
3. Interviewers are willing to self-report and be verified via LinkedIn/GitHub/resume rather than requiring in-person or notarized identity verification for MVP.
4. Commission-based pricing (rather than flat listing fees or subscriptions) is the right primary monetization lever for this specific marketplace, based on comparable Astrotalk/Upwork dynamics.
5. A manual (human Admin) verification and dispute-resolution process is acceptable at MVP scale (hundreds, not tens of thousands, of interviewers/bookings) before automation is required.
6. Students are willing to pay out-of-pocket (not solely relying on institutional/college-sponsored credits) for at least the initial cohort of bookings.
7. The 48-hour feedback-submission SLA and 72-hour dispute-resolution SLA are operationally achievable with a small initial ops team.
8. No AI-interviewer feature is required for MVP product-market fit — the human-only positioning is itself the differentiator, not a temporary limitation.

---

## 63. Open Questions

1. What is the exact target commission percentage at launch, and should it differ by category (e.g., lower commission for high-value System Design sessions to attract senior interviewers)?
2. What identity verification standard is legally/operationally sufficient for Interviewers — is LinkedIn + GitHub + resume cross-check enough, or is a formal ID-document check required from day one?
3. Does the wallet design (Section 20) require a formal legal opinion on India's PPI (Prepaid Payment Instrument) regulations before launch, given money is held on behalf of users even transiently?
4. Should Interviewer withdrawal require a minimum session count or "trust score" threshold before Interviewers can withdraw at all (anti-fraud), or should first withdrawal be unrestricted to maximize trust/onboarding satisfaction?
5. What is the right free-cancellation window for Students (e.g., 12h, 24h before session) to balance Student flexibility against Interviewer schedule-reliability?
6. Should the platform support group/panel interviews (multiple interviewers, one student) in a later version, and does that change the core data model meaningfully?
7. How should RoundIQ handle categories with very thin supply (e.g., a niche category with only 1–2 interviewers) — hide the category, or accept longer wait times?
8. What specific legal terms (Interviewer Agreement, Student Terms of Service, refund policy as a binding legal document, independent-contractor classification for Interviewers) need formal legal drafting before launch, beyond the product-level policy described in this document?

---

## 64. Final Product Blueprint (Summary)

RoundIQ is a commission-based, two-sided marketplace for human-conducted technical mock interviews, built India-first on Next.js/React/TypeScript (frontend), Node.js/Express/TypeScript (backend), PostgreSQL + Redis (data layer), Razorpay + RazorpayX (payments and payouts), and Google Calendar/Meet (session delivery) — deliberately excluding any AI-interviewer or AI-feedback functionality from its MVP in order to own a defensible "real human, real accountability" position against a market saturated with AI mock-interview tools.

**The three pillars the entire system is engineered around:**
1. **Zero-double-booking, zero-ambiguous-payment scheduling and commerce** — enforced at the database transaction level, not just in application logic, because a marketplace's entire trust foundation collapses the first time money or time gets double-committed.
2. **A ledger-based, auditable financial core** — every rupee that moves through Booking → Escrow → Commission → Payout → Withdrawal is traceable through an immutable transaction log, because a marketplace that can't reconcile its own money cannot survive scrutiny from users, payment partners, or regulators.
3. **Structured, comparable, accountability-enforced feedback and reviews** — the actual product value Students are paying for isn't just "an interview," it's a *reliable, structured, honest assessment*, and every part of the feedback/review system (mandatory submission windows, review-gated-on-payment, no-delete-of-legitimate-reviews) exists to protect that value.

Everything else in this document — the admin tooling, the dispute resolution flows, the notification system, the roadmap sequencing — exists in service of making those three pillars operate reliably at increasing scale, from a 30-interviewer soft launch to a nationwide (and eventually multi-country) marketplace. This document is intended to be handed directly to a founding engineering team as a complete, build-ready specification; Sections 61–63 (Risks, Assumptions, Open Questions) should be explicitly revisited and resolved with legal, finance, and founding-team input before the first production deploy.

---

*End of RoundIQ Master Product & Engineering Blueprint.*
