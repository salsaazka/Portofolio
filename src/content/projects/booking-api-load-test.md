---
order: 2
title: "Booking API Load Test"
kind: "Performance"
year: "2025"
role: "QA Engineer"
team: "Backend team"
tools: ["k6", "API Testing"]
summary: "Ramp-up scenarios that found where the booking endpoints start to slow down — before real traffic did."
sample: true  # set to false once this page has real content
terminal:
  - ["cmd", "k6 run booking-load.js"]
  - ["l", "scenarios: ramping-vus"]
  - ["ok", "✓ status is 200"]
  - ["ok", "✓ http_req_duration p(95)<500ms"]
  - ["l", "checks........: 100%"]
  - ["sum", "thresholds passed"]
---
## Context

Ramp-up scenarios that found where the booking endpoints start to slow down — before real traffic did. <span class="ph">Replace with the real story: the product, the team, and why testing mattered here.</span>

## What I did

- <span class="ph">Mapped the critical user journeys and risks.</span>
- <span class="ph">Wrote the test cases / scripts and wired them into the workflow.</span>
- <span class="ph">Reported and followed defects through to the fix.</span>

## Outcome

<span class="ph">Measurable result goes here — e.g. regression time, bugs caught before release, response time under load.</span>
