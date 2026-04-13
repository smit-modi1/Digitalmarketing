# Ukshoppinghub

Multi-page affiliate content site with:

- separate public pages for Home, Articles, Recommendations, About Us, Privacy Policy, Contact Us, and Categories
- dedicated article and category detail pages
- a private admin dashboard for managing recommendations
- persistent product and contact storage
- Vercel-ready API routes for login, products, and contact submissions
- optional Gmail delivery support for contact form messages

## Run locally

```powershell
npm start
```

Use Node.js 20 or newer.

## Admin login

- `masteradmin` / `admin123`

## Optional email delivery

To send contact form messages to Gmail in addition to storing them in the admin inbox, set:

- `EMAIL_SMTP_USER`
- `EMAIL_SMTP_PASS`
- `CONTACT_INBOX_EMAIL`

If those are not set, messages are still saved in the dashboard inbox.
