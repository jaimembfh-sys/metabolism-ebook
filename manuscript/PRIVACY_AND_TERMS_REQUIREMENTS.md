# What a privacy policy and terms of service need to cover

Working notes for filling in a template generator. Written 2026-09-24.

**This is not legal advice and not a substitute for a lawyer.** It is an
inventory of what the app actually collects and does, so that the answers given
to a generator are accurate. A generator's output is only as good as the facts
fed into it, and most generators assume a business that collects a name and an
email.

---

## 1. Data inventory — what to tell the generator you collect

| Category | Specifics | Where it lives |
|---|---|---|
| Account | Email, password | Memberstack (once piece 0 ships) |
| Purchase | Order records, customer email | Shopify |
| **Health history** | Medical conditions, medications, family history, eating-disorder history, out-of-control-eating frequency, whether they see a therapist | Upstash Redis |
| **Body data** | Weight over time, measurements | Upstash Redis |
| **Body photographs** | Progress photos the user uploads | Netlify Blobs |
| Behaviour | Meals eaten, fasting hours, exercise, habit check-offs | Upstash Redis |
| **Free-text health conversations** | Everything said to the AI coach about symptoms, health, eating | Sent to Anthropic; not retained by us beyond the session |
| Derived | A stored `disordered_eating_signal` flag inferred from intake answers | Upstash Redis |
| Technical | IP address, browser, device — ordinary server logs | Netlify |

The bolded rows are why a generic template will not fit without editing.

---

## 2. Five disclosures generators routinely miss

### 2.1 Health conversations go to a third party

The coach forwards what users write to **Anthropic**. That is a sub-processor
handling health-related free text and it must be named. The full list for the
"third parties we share data with" section:

- **Anthropic** — AI model provider, receives health conversation content
- **Shopify** — payments and order records
- **Memberstack** — accounts and authentication
- **Netlify** — hosting, serverless functions, image storage
- **Upstash** — database

### 2.2 Body photographs are stored

Say where (US cloud storage), who can access them (only the user), and what
deletion does. Photographs of a person's body are a category most templates do
not anticipate.

### 2.3 A health inference is stored that the user never sees

The app derives and stores `disordered_eating_signal` from three intake answers,
and it changes what the app shows that person. "We personalise your experience"
technically covers it, but a user has a reasonable expectation of knowing that a
health inference is held about them. **Disclose it explicitly.** See
`CONSERVATIVE_DEFAULTS.md` section 1 for how it is set.

### 2.4 Retention and deletion need an actual answer

Generators default to vague. Decide now, and say it plainly. A defensible
position given what is held:

> We keep your health information while your account is active. You can ask us
> to delete it at any time, and we will do so within 30 days.

### 2.5 No under-18 users

State it in the privacy policy and make it a condition of use in the terms.
There is currently no age verification, so the claim must be about intent and
terms, not about a control that does not exist.

---

## 3. Terms of service — clauses this product specifically needs

- **Not medical advice**, and not a substitute for a clinician. Reuse the
  wording already accepted in the meal-planner disclaimer rather than writing a
  second version that says something slightly different.
- **AI-generated content can be wrong.** Stated plainly, not buried.
- **No guarantee of results.** The coach layer already forbids claiming
  guarantees; the terms should match.
- **Refund policy.** Shopify requires one regardless.
- **What happens to user data if the business stops operating.**
- **Age requirement** — 18 or over.

---

## 4. Two things to fix before either document is published

### 4.1 The information-disclosure gap is still live

`server.js` and `package.json` are publicly readable on the deployed site right
now. A privacy policy asserting reasonable security measures while those are
being served would be inaccurate. **The fix is already committed and needs a
deploy.**

### 4.2 Piece 0 is not done

Until server-side identity ships, the API returns a user's health record to
anyone who supplies their identifier, because that identifier comes from the
client and is not verified. **Do not publish a privacy policy describing
safeguards that do not exist yet.** Ship piece 0, then write the policy to
describe what is actually true.

---

## 5. The one question worth paying for

Whether **Washington's My Health My Data Act** applies. It is broad, it covers
consumer health data held by non-HIPAA businesses, and it carries a **private
right of action** — individuals can sue directly rather than waiting for a
regulator. No template generator will ask about it.

If an hour of legal time ever becomes affordable, spend it on that single
question rather than on reviewing generated documents.

Also live, in rough order of likelihood:

- **FTC Health Breach Notification Rule** — probably applies
- **California CMIA and CCPA** — apply to California users
- **GDPR** — special-category data for any EU user; the app does not target the
  EU but does not block it either
- **Illinois BIPA and equivalents** — probably not engaged, since no biometric
  identification is performed, but body photographs are stored

HIPAA most likely does **not** apply: not a covered entity, no insurance
billing, no clinician involvement.

---

*Cross-cutting decision: cross-user research (former Phase G) was dropped
entirely on 2026-09-24, which removes the largest single source of exposure
here. No research consent flow exists and no data is being collected for one.
See `CONSERVATIVE_DEFAULTS.md` section 4.*
