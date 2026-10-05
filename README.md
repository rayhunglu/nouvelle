# Nouvelle Anti-Aging — Website Redesign

React rebuild of https://nouvelle-anti-aging.com/ (originally a GoDaddy Website Builder site).

**Status:** Working prototype · **Started:** 2026-10-03

## Stack
Vite + React 19 · React Router · Tailwind CSS v4 · lucide-react icons, served by an Express backend.

```
webapp/   React app (Vite root is "/", entry is webapp/main.jsx)
src/      Express backend — builds/serves webapp and handles /api/*
dist/     Vite build output (generated, served as static files by src/app.js)
```

```bash
npm install
npm run dev      # Vite dev server only, http://localhost:5173 (no API — use for UI iteration)
npm run start    # builds the UI then runs the Express server: UI + /api on http://localhost:3000
```

`npm start` is the one-command way to run the whole app — it builds `webapp/` with Vite into `dist/`, then Express serves that build as static files and handles `/api/*` routes on the same port.

## Structure
| Route | Replaces on old site |
|---|---|
| `/` | Home |
| `/treatments` | (new) category index |
| `/treatments/:slug` | 9 service pages: injectables, skin, hair, body, wellness, iv-therapy, hormone-stem-cell, spa, microblading |
| `/faq` | 12 separate "Q&A …" pages → one searchable page, with deep links like `/faq#botox` |
| `/contact` | Contact Us + careers form |

All copy lives in `webapp/data/site.js` and `webapp/data/faqs.js` as `{ en, zh }` pairs, so the EN / 中文 toggle swaps languages instead of showing both side by side.

`Contact.jsx` posts to `/api/contact` and `/api/careers` (handled in `src/routes/contact.js`), which currently just validate required fields and `console.log` the submission — swap that for a real email/CRM/storage call before launch. The careers form's resume file isn't uploaded yet (no multer wiring on the backend).

## Before launch
- [ ] **Hours conflict.** The old home page says 10am–6pm by appointment; the old Contact page says Mon–Fri 9am–7pm. The new site uses the Contact page hours.
- [ ] **Wire the contact/careers API routes** to a real destination (email, CRM, DB) instead of `console.log`, and add file upload (multer) for resumes.
- [ ] **Images are hotlinked** from the old site's CDN (`img1.wsimg.com`). Download them into `/public` before the old site is cancelled.
- [ ] **Copy review.** All text was rewritten. The clinic should check medical claims and FAQ answers.
- [ ] Add real before/after photos (the old site had an empty section for these).
- [ ] Deployment now needs a Node host (Render, Fly, a VM, etc.) since Express serves the app — a static host like Vercel/Netlify alone won't run `/api/*`.
