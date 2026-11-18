---
order: 3
title: "API Contract Checks"
kind: "API testing"
year: "2025"
role: "QA Engineer"
team: "Backend team"
tools: ["API Testing", "JavaScript"]
summary: "Schema and error-path checks for core endpoints, so breaking changes get flagged in review."
sample: true  # set to false once this page has real content
terminal:
  - ["cmd", "npm run test:api"]
  - ["ok", "✓ GET /packages → 200 schema"]
  - ["ok", "✓ POST /orders → 422 on invalid"]
  - ["ok", "✓ auth token expired → 401"]
  - ["sum", "3 suites passed"]
---
## Context

Schema and error-path checks for core endpoints, so breaking changes get flagged in review. <span class="ph">Replace with the real story: the product, the team, and why testing mattered here.</span>

## What I did

- <span class="ph">Mapped the critical user journeys and risks.</span>
- <span class="ph">Wrote the test cases / scripts and wired them into the workflow.</span>
- <span class="ph">Reported and followed defects through to the fix.</span>

## Outcome

<span class="ph">Measurable result goes here — e.g. regression time, bugs caught before release, response time under load.</span>
