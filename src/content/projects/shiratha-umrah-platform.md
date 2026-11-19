---
order: 2
title: "Shiratha Umrah & Halal Travel"
kind: "Web, mobile & API QA"
year: "2026"
role: "QA Tester"
team: "Treetan Nusantara Network"
tools: ["Manual Testing", "Apidog", "k6", "Appium"]
summary: "All-feature testing of the Umrah and halal travel platform, plus API performance checks with k6 and mobile automation with Appium."
sample: false
terminal:
  - ["cmd", "k6 run shiratha-api.js"]
  - ["ok", "✓ package list API → within threshold"]
  - ["ok", "✓ appium: app launch + search"]
  - ["ok", "✓ package card → date, price, seats"]
  - ["sum", "web + app + api checked"]
---
## Context

Shiratha is Treetan's consumer brand for Umrah and halal travel. Travellers compare packages from many travel agents (dates, prices, remaining seats) and book on the website or in the mobile app.

## What I did

- Tested all features of the platform, on the website and in the mobile app.
- Checked API performance in Apidog, with load scenarios run in k6.
- Wrote mobile test scripts and ran them with Appium.
- Logged defects with steps to reproduce and verified the fixes.

## Screens

![Shiratha package list and app promotion](../../assets/projects/shiratha-packages.jpeg)

![Shiratha app home screen](../../assets/projects/shiratha-app-home.jpg)

## Outcome

Part of my current work as QA Tester at Treetan.
