# Backend Changes Needed (Phase I Alignment)

Based on the client doc (Phase I Status & Alignment Record, Feb 25, 2026) and current frontend behavior, the following need to be done on the **backend**:

---

## 1. OTP Not Sending / Direct Verify Issue

**Issue:** "OTP ni jata ab direct OTP verify ho raha hai" — OTP is not being sent, but verification is happening directly.

**Backend should:**
- **Signup (customer/admin):** When a new user is created, send OTP via **email** (and optionally SMS if configured). Store OTP with expiry; do not mark user as verified until OTP is verified or first-login OTP flow (see below).
- **Login:** If user is not verified, return a clear error (e.g. `message` containing "not verified" or "verify") so frontend can redirect to `/otp?email=...`. Do not return a token until the account is verified (or backend implements optional first-login OTP).
- **Verify OTP:** `POST /api/verify-otp` should validate the OTP and then mark the user as verified so that next login succeeds.
- **Resend OTP:** `POST /api/resend-otp` should actually send a new OTP (email/SMS) and return success. Ensure email/SMS service is configured and working.

**Check:** Email/SMS provider (e.g. SendGrid, Twilio) is configured and OTP is actually sent on signup and resend. If backend auto-verifies or skips sending OTP, that would explain "direct verify" with no OTP received.

---

## 2. Admin-Created Customers: Active by Default

**Doc:** "Customers created by an Admin shall be provisioned in an **active state by default**, eliminating the need for immediate OTP verification at the time of creation."

**Backend should:**
- When an **admin** (or super-admin) creates a customer via signup API, create the user as **active/verified** so they can log in without OTP at creation time.
- Optionally: support **first-login OTP** (single-use) for that customer later, if you want to enforce verification on first independent login. Doc says this may be "conditionally enforced" for security.

**Frontend:** Already shows "Customer created. They can log in now." and treats new admin-created customer as Active. If backend returns `approved: true` or `is_verified: true` for such users, frontend can use it; otherwise current behavior is fine once backend creates them active.

---

## 3. Instant Estimate: Email + SMS Delivery

**Doc:** "Instant Estimate generation and **simultaneous email + SMS delivery** reviewed."

**Backend should:**
- When an instant estimate is created (e.g. `POST /api/instant-estimates` or equivalent), trigger **both**:
  - Email (e.g. SendGrid) with estimate summary/link.
  - SMS to the customer's phone (if available).
- Return a success response so frontend can show: "Estimate submitted! A copy has been sent by email and SMS."

**Frontend:** Already shows the above message on success. Backend must ensure both email and SMS are sent so the message is accurate.

---

## 4. Deployment / Environment

**Doc:** Production must be on public domain, live DB, live SendGrid and SMS — no localhost-only.

**Backend should:**
- Use environment variables for: DB URL, SendGrid API key, SMS provider credentials, base URL for links in emails.
- Ensure production env is used for live deployment and that email/SMS are not disabled or mocked in prod.

---

## Summary Table

| # | Item | Owner |
|---|------|--------|
| 1 | OTP: Actually send OTP on signup/resend; only allow verify after OTP or explicit active state | Backend |
| 2 | Admin-created customers: Create as active by default, no OTP at creation | Backend |
| 3 | Instant estimate: Send both email and SMS when estimate is created | Backend |
| 4 | Production: Live DB, SendGrid, SMS; no localhost-only | Backend / DevOps |

Frontend changes for Phase I alignment (Companies → Subscribers, customer creation message, instant estimate success message) are already done.
