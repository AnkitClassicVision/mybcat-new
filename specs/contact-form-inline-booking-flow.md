---
title: "Spec: Contact Page — Inline Post-Submit Booking Flow"
description: "Spec: Contact Page — Inline Post-Submit Booking Flow"
---

# Spec: Contact Page — Inline Post-Submit Booking Flow

**Status:** SUPERSEDED on 2026-08-11 by `docs/plans/2026-08-11-seo-revenue-reset-implementation.md`

> Do not implement this document's direct HubSpot submission or optimistic-success behavior. The current contract requires durable estate intake acceptance before the success state appears, keeps the intake layer independent from the CRM, and treats Twenty as non-canonical until its separate cutover gate passes. This file remains as historical decision context only.
**File to modify:** `src/pages/contact.astro`
**Related URL:** `/contact/`

---

## System Overview

The MyBCAT contact page contains a HubSpot form (portal `23344341`, form `a365996f-87cf-4a60-8782-9dabb9f9dd97`) that potential enterprise customers use to request a discovery call. Currently, upon submission HubSpot redirects the user to a new page (the meeting scheduler). This spec defines a new flow where the user never leaves the contact page: the form is replaced with a thank-you state and an inline HubSpot meeting scheduler within 750ms of pressing submit.

---

## Behavioral Contract

### Primary (happy path) flows

**When the user fills out the contact form and clicks submit:**
- The system detects form submission within 750ms
- The form wrapper fades out with a 150ms opacity transition, then is replaced by the post-submit state
- A thank-you message appears in the same visual space the form occupied, containing:
  - A heading: **"You're all set — we'll be in touch!"**
  - Body copy: *"Two things are happening now: (1) Check your inbox (and spam folder) for a confirmation email with your meeting details and our follow-up. (2) You can grab a time on our calendar right now — it's ready below."*
- The HubSpot meeting scheduler (`https://hubspot.mybcat.com/meetings/ankit98/mybcat-discovery-call`) appears embedded in an iframe directly below the thank-you message, pre-filled with the user's first name, last name, and email from the submitted form
- The total time from clicking submit to seeing the thank-you message + embedded scheduler must be under 750ms

**When the user's first name, last name, and email are available from form submission:**
- The system appends `?firstName=X&lastName=Y&email=Z` query parameters to the meetings URL before setting it as the iframe `src`
- The meeting scheduler iframe pre-fills these fields automatically upon load

**When the user closes the page after submitting but before booking:**
- No action is required from this system; HubSpot's automation sends the booking link email independently

**When the user submits the form a second time (resubmit or page reload + resubmit):**
- The same post-submit state is shown again (thank-you + calendar iframe)

### Error flows

**When the HubSpot meetings iframe fails to load (network error, domain unreachable):**
- The thank-you message is still shown immediately
- Below the thank-you text, in place of the broken iframe, the system shows a plain text fallback: "Can't see the calendar? Book directly at: [clickable link to the meetings URL]"
- The user is never shown a blank space or broken embed with no call to action

**When the HubSpot form submission fails (network error, validation error):**
- The system does not trigger the post-submit state
- HubSpot's own inline error handling remains active and visible to the user
- The form stays visible with error messages

### Boundary conditions

**When only partial form data is available (e.g., email present but no first name):**
- The system appends only the available fields as query parameters; omitted fields are not included
- The meetings URL is still valid and loads without pre-fill for missing fields

**When the form submission event fires but contains no recognizable data:**
- The system still transitions to the post-submit state (thank-you + iframe without pre-fill)
- The meetings URL is used without any query parameters

---

## Explicit Non-Behaviors

**The system must not navigate the user to a new page or tab**, because the entire purpose of this change is to keep the user on the contact page.

**The system must not show HubSpot's default post-submit page** (the current redirect behavior being replaced). The redirect to HubSpot's standalone meeting scheduler page must be suppressed entirely.

**The system must not delay showing the thank-you state by more than 750ms after submit**, because drop-off is the primary risk; any perceptible pause causes abandonment.

**The system must not re-show the form** after the post-submit state has been triggered (on that page load). The form is gone from the user's view permanently.

**The system must not modify HubSpot's CRM behavior** — form data is still submitted to HubSpot, the contact record is still created, and HubSpot's automation still fires the follow-up email. Only the browser-side post-submit UI changes.

**The system must not add extra fields, steps, or friction to the booking flow.** The meeting scheduler is embedded as-is; no wrapper form, no additional questions.

---

## Integration Boundaries

### HubSpot Forms API

- **In:** User-filled form data (firstname, lastname, email, and other fields)
- **Out:** Form submission posted to HubSpot (portal `23344341`, form `a365996f-87cf-4a60-8782-9dabb9f9dd97`); creates/updates a contact record and triggers HubSpot automations
- **Callback contract:** HubSpot fires a `window.postMessage` event with structure `{ type: 'hsFormCallback', eventName: 'onFormSubmitted', id: '<formId>', data: { submissionValues: { email, firstname, lastname, ... } } }` after successful submission
- **Implementation note:** Replace the current `hs-form-html` web component embed with `hbspt.forms.create()` (loaded via `https://js.hsforms.net/forms/embed/v2.js`) so that the `onFormSubmitted` JavaScript callback is available. Pass `inlineMessage: ' '` to `hbspt.forms.create()` to suppress HubSpot's built-in redirect behavior while keeping CRM submission intact. The portal ID, form ID, and region remain unchanged.
- **If unavailable:** If the HubSpot forms script fails to load, the form skeleton remains visible (existing behavior); no post-submit state is triggered.

### HubSpot Meetings Scheduler (iframe embed)

- **In:** Query parameters `firstName`, `lastName`, `email` to pre-fill the booking form
- **Full URL pattern:** `https://hubspot.mybcat.com/meetings/ankit98/mybcat-discovery-call?firstName=X&lastName=Y&email=Z`
- **Expected behavior:** HubSpot meetings pages are served without `X-Frame-Options` restrictions and can be embedded in iframes cross-origin. **The agent must verify this empirically BEFORE writing iframe code** by using the `agent-browser` skill to navigate to `https://hubspot.mybcat.com/meetings/ankit98/mybcat-discovery-call` and attempt to embed it in a test iframe, then inspect browser console for frame-blocking errors (`Refused to display ... in a frame`) or CSP violations.
- **Fallback if iframe is blocked:** If the URL cannot be framed, the agent must implement a fallback: display a prominent styled button/link `"Book your time →"` pointing to the meetings URL (opens in new tab, `target="_blank" rel="noopener"`), accompanied by the explanatory text. The iframe strategy is preferred; the link fallback is the safety net.
- **If unavailable:** Show the plain-text fallback link described in Error Flows above.

### HubSpot Automation (email)

- **No change required.** The existing HubSpot workflow that sends a follow-up email after form submission continues to fire based on CRM contact creation. This system does not send or trigger the email.

---

## Behavioral Scenarios

These scenarios are evaluated externally (manually or via end-to-end test). The agent must not write code that only satisfies these descriptions without producing the actual behavior.

### Happy Path 1 — Full form submit, all fields present

**Setup:** User is on `/contact/`. The HubSpot form is loaded and visible. The form has fields for first name, last name, email, and organization.

**Actions:** User fills in: First Name = "Sarah", Last Name = "Chen", Email = "sarah@example.com", Organization = "VisionCo". User clicks submit.

**Expected observable outcome:**
1. Within 750ms: the form area disappears and a thank-you message is visible in its place
2. Below the thank-you message: a HubSpot meeting scheduler iframe is visible and begins loading
3. The page URL has NOT changed (still `/contact/` — no redirect)
4. The iframe `src` attribute contains `firstName=Sarah&lastName=Chen&email=sarah%40example.com` (or URL-encoded equivalent)
5. Once the iframe finishes loading, the name and email fields inside the scheduler are pre-filled
6. No new tab has opened

### Happy Path 2 — User books a meeting after form submit

**Setup:** Same as Happy Path 1. The post-submit state is showing; the iframe scheduler is loaded with pre-filled fields.

**Actions:** User selects a time slot in the iframe, fills in any remaining fields, and clicks the booking confirmation button inside the iframe.

**Expected observable outcome:**
1. The meeting is booked inside the iframe (HubSpot confirmation message appears within the iframe)
2. The parent page (`/contact/`) remains unchanged — still showing the thank-you message above the iframe
3. User has not been taken to a new page

### Happy Path 3 — Resubmit scenario

**Setup:** User has already submitted the form once and sees the post-submit state.

**Actions:** User navigates away and returns to `/contact/`. The page has freshly loaded — the form is visible again. User fills in a different email and submits again.

**Expected observable outcome:**
1. The same post-submit flow triggers again (thank-you + iframe)
2. The new email is pre-filled in the iframe scheduler

### Error Scenario 1 — iframe fails to load

**Setup:** User submits the form. The meeting scheduler URL is unreachable (simulate by blocking the domain in browser devtools network tab).

**Expected observable outcome:**
1. The thank-you message appears within 750ms (no dependency on iframe load)
2. In the area where the iframe would appear, a fallback element is visible containing a direct link to the meetings URL
3. The link text makes the action clear (e.g., "Book your discovery call directly →")
4. Clicking the link opens the meetings page (new tab acceptable for fallback)

### Error Scenario 2 — Form submission fails (validation error)

**Setup:** User fills in only the email field (leaves required fields blank) and clicks submit.

**Expected observable outcome:**
1. HubSpot's inline validation error messages appear below the empty required fields
2. The post-submit state (thank-you + iframe) does NOT appear
3. The form remains fully visible and interactable

### Edge Case 1 — Only email available, no name fields

**Setup:** The HubSpot form only collects email (hypothetical reduced form), or the name fields are blank on submission.

**Expected observable outcome:**
1. Post-submit state triggers within 750ms
2. The iframe `src` only contains `email=...` query parameter
3. The scheduler loads and the email field is pre-filled; name fields are empty (user fills them in)
4. No JavaScript error occurs from missing name values

### Edge Case 2 — Special characters in form fields

**Setup:** User submits with name "O'Brien" and email "user+test@example.com".

**Expected observable outcome:**
1. The meetings iframe URL has properly URL-encoded query parameters: `firstName=O%27Brien&email=user%2Btest%40example.com`
2. The iframe loads and the meeting scheduler correctly decodes the pre-filled values
3. No broken URL, no JavaScript error

---

## Ambiguity Warnings

### AW-1: Iframe embeddability — RESOLVED (requires pre-implementation test)

**Resolution:** The agent must use the `agent-browser` skill to test `https://hubspot.mybcat.com/meetings/ankit98/mybcat-discovery-call` in an iframe before writing production code. If embeddable: use iframe. If blocked: use the styled-link fallback described in Integration Boundaries. The spec covers both paths; the agent chooses based on test result.

### AW-2: Transition animation — RESOLVED

**Resolution:** Subtle 150ms opacity fade. The form fades to `opacity: 0` over 150ms, then `display: none` is applied and the post-submit state fades in from `opacity: 0` to `opacity: 1` over 150ms. Total animation budget: 300ms, well within the 750ms ceiling.

### AW-3: Thank-you copy — RESOLVED

**Resolution (exact copy):**
- **Heading:** "You're all set — we'll be in touch!"
- **Body:** "Two things are happening now: (1) Check your inbox (and spam folder) for a confirmation email with your meeting details and our follow-up. (2) You can grab a time on our calendar right now — it's ready below."

### AW-4: Sidebar behavior — RESOLVED

**Resolution:** Sidebar is completely unaffected by form submission. Only the form column (left side) transitions to the post-submit state.

### AW-5: Mobile layout of post-submit iframe — RESOLVED

**Resolution:** Use best practices for responsive iframe height. The agent must:
- Set `width: 100%` on the iframe
- Use a minimum height of `700px` on desktop and `800px` on mobile (calendar grids need vertical room)
- Test the iframe at 375px, 768px, and 1280px viewport widths to confirm the scheduler is fully usable without horizontal scroll at each breakpoint
- Ensure the post-submit state scrolls naturally on mobile (no fixed-height containers that clip the calendar)

---

## Implementation Constraints

- **Framework:** Astro (`src/pages/contact.astro`). All JavaScript is in a `<script>` tag at the bottom of the file (Astro client-side script).
- **Do not use a separate JS file** unless there is a clear reason — keep changes scoped to `contact.astro`.
- **Replace the current embed mechanism:** The `hs-form-html` web component (`<div class="hs-form-html" ...>`) and its script (`embed/developer/23344341.js`) must be replaced with `hbspt.forms.create()` loaded via `https://js.hsforms.net/forms/embed/v2.js`. Maintain the same `portalId`, `formId`, and `region`.
- **HubSpot automation must not break:** The form must still submit to HubSpot CRM. Do not intercept or block the network request — only change the browser-side UI behavior post-submit.
- **No external libraries** may be added for this feature. Vanilla JS only.
- **No CSS framework changes.** The post-submit state should use the existing CSS variable system (`--oceanic-teal`, `--navy-900`, `--glass-border`, etc.) already in the file.
- **Existing skeleton loader** (`#form-skeleton`) behavior must be preserved — it should still hide when the form loads.
