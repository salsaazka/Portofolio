---
order: 4
title: "Wondo Travel & Experiences"
kind: "Backend & API"
year: "2026"
role: "Back End Developer"
team: "Wondo"
tools: ["Laravel", "Postman", "REST API", "API Documentation"]
summary: "Backend for the Wondo website and its two apps, Wondo and Wondo Merchant: APIs built with Laravel, tested in Postman and documented."
sample: false
terminal:
  - ["cmd", "php artisan route:list --path=api"]
  - ["l", "GET|HEAD  api/events ........... EventController@index"]
  - ["cmd", "newman run wondo.postman_collection.json"]
  - ["ok", "✓ API collection passed"]
  - ["sum", "web + Wondo + Wondo Merchant"]
---
## Context

Wondo is a platform for finding events, activities and destinations in Indonesia, from concerts and workshops to mountain trips. It runs as a website and as two mobile apps: Wondo for travellers and Wondo Merchant for the businesses that offer the activities.

## What I did

- Built the APIs with Laravel for the website and both apps.
- Consumed APIs from other services and integrated them into the product.
- Tested the APIs in Postman.
- Wrote the API documentation for the team.

## Screens

![Wondo website, trending section](../../assets/projects/wondo-trending.jpeg)

![Wondo app splash screen](../../assets/projects/wondo-app-splash.jpeg) ![Wondo app launch screen](../../assets/projects/wondo-app-launch.jpeg)
