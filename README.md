KAVO — Local Preview

How to run locally:

1. Install dependencies:

```powershell
npm install
```

2. Create a local env file:

```powershell
Copy-Item .env.example .env
```

3. Start a static server (local port 5000):

```powershell
npm start
```

Then open http://localhost:5000 in your browser.

Contact form email setup:

- Set `RESEND_API_KEY` in `.env`.
- Optionally override `CONTACT_FROM_EMAIL`, `CONTACT_ADMIN_EMAIL`, and `PUBLIC_SITE_URL`.
- The frontend submits to `/api/contact`.
- On Vercel, this is handled by `api/contact.js`.
- On Netlify, `netlify.toml` rewrites `/api/contact` to the Netlify function.

Files of interest:
- `index.html` — main page
- `css/styles.css` — styles
- `js/main.js` — interactions
- `api/contact.js` — Vercel contact endpoint
- `netlify/functions/contact.js` — Netlify contact endpoint
- `server/contact-email.js` — shared Resend email logic
