# Srujan

Portfolio site for Sai Srujan Pasala, Digital Health Strategist. Next.js (App Router), React, TypeScript, Tailwind CSS.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests
npm run lint
```

## Build and deploy

```bash
npm run build      # runs the content check first (scripts/check-content.ts)
npm start
```

Set `NEXT_PUBLIC_SITE_URL` to the site's public address (for example `https://srujan.netlify.app`) so the
canonical link, sitemap, robots.txt, share image and structured data use absolute URLs. See `.env.example`.
