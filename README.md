# Porto Salsa

Personal portfolio for Salsabila Azka Putri, QA Engineer. Built with Astro, GSAP + ScrollTrigger and Lenis.
Pages switch without a reload (Astro `<ClientRouter />`), with a lime "test passed" curtain between them.

## Run it

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static site in dist/
npm run preview    # serve the build
```

Add `?intro` to the URL to replay the first-visit loader (it otherwise shows once per browser session).

## Where to edit

| What | File |
|---|---|
| Name, email, LinkedIn, **WhatsApp number**, nav | `src/config.ts` |
| Projects (one Markdown file each, URL = file name) | `src/content/projects/*.md` |
| Work history (timeline) | `src/content/experience.json` |
| Home sections | `src/components/home/*.astro` |
| Colours, fonts, all styles | `src/styles/global.css` (tokens at the top) |
| Every animation + page-transition lifecycle | `src/scripts/motion.ts` |
| Photos | `src/assets/` (optimised automatically at build) |

Project files have `sample: true` while they hold placeholder text; that shows a SAMPLE badge.
Set it to `false` once the page has the real story.

## Deploy (Vercel)

Push the repo to GitHub, then on vercel.com: **Add New → Project → import the repo → Deploy**.
Astro is detected automatically; no settings needed. Update `site` in `astro.config.mjs` to the final domain.

`design/` is the original single-file HTML prototype, kept for reference. It is not part of the build.
