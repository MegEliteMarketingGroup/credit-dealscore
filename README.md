# Deal Score — React / TypeScript / Tailwind

Converted from the Deal Score v9 HTML prototype. Vite + React 19 + TypeScript + Tailwind CSS 3.

## Run

```bash
npm install
npm run dev
```

Open the local URL Vite prints, usually http://localhost:5173.

Build: `npm run build` — the static output is in `dist/`.

## Source layout

- `src/App.tsx` — dashboard, application board, deal matching, reviews, workflow controls
- `src/types.ts` — typed applicants, vehicles and scores
- `src/data/demo.ts` — sample applicants and inventory
- `src/lib/scoring.ts` — standalone scoring logic and household aggregation
- `src/index.css` / `tailwind.config.js` — brand theme and reusable styles

## Important

This is a **front-end prototype** using mock records. It is not linked to GHL, DCS, an authentication system, or a database. Changes are in memory and reset on reload. Do not publish customer credit data to an unauthenticated page.

The score formula was ported from v9 including the explicit low-risk +1 bonus and the one-pass recalculation for required down. The source formula needs further review/validation before lending use.

To deploy the React build to a host such as Vercel or Cloudflare Pages, set build command `npm run build` and output directory `dist`. The React source should not be pasted into a GHL HTML element; host the build separately and link to it from GHL.
