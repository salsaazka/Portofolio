---
order: 1
title: "Checkout E2E Suite"
kind: "Test automation"
year: "2025"
role: "QA Engineer"
team: "Product squad"
tools: ["Playwright", "JavaScript", "CI"]
summary: "End-to-end regression for the booking-to-payment journey, running on every pull request."
sample: true  # set to false once this page has real content
terminal:
  - ["cmd", "npx playwright test"]
  - ["ok", "✓ auth/login.spec.ts"]
  - ["ok", "✓ booking/search.spec.ts"]
  - ["ok", "✓ booking/checkout.spec.ts"]
  - ["ok", "✓ payment/confirm.spec.ts"]
  - ["sum", "4 passed"]
---
## Context

End-to-end regression for the booking-to-payment journey, running on every pull request. <span class="ph">Replace with the real story: the product, the team, and why testing mattered here.</span>

## What I did

- <span class="ph">Mapped the critical user journeys and risks.</span>
- <span class="ph">Wrote the test cases / scripts and wired them into the workflow.</span>
- <span class="ph">Reported and followed defects through to the fix.</span>

## Outcome

<span class="ph">Measurable result goes here — e.g. regression time, bugs caught before release, response time under load.</span>
