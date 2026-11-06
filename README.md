# Arx Tessera (`najialess.io`) — Architecture, Docker & Vercel Deployment Guide

## 1. Architecture Overview & Best Practices Implemented

This repository is structured for dual-mode deployment:
1. **Dockerized Multi-Container Stack (Local & Self-Hosted Cloud):**
   - **Frontend (`port 3002`):** High-performance `nginx:1.27-alpine` container ([Dockerfile.frontend](Dockerfile.frontend) + [nginx.conf](nginx.conf)) serving the static frontend (`index.html`, `style.css`, `script.js`, `logo.svg`) on port `3002` and reverse-proxying `/api/*` requests directly to `http://backend:8082/api/`.
   - **Backend (`port 8082`):** Hardened `node:22-alpine` Express API server ([Dockerfile.backend](Dockerfile.backend) + [server.js](server.js)) running as a non-root user on port `8082`, equipped with `helmet` security headers, CORS protection, rate limiting (`express-rate-limit`), honeypot bot filtering, and health checks.
2. **Zero-Config Vercel Serverless Deployment:**
   - Static files at the project root are served directly by Vercel's Edge Network.
   - Serverless functions inside [`/api`](api/) (`api/contact.js`, `api/inbound-email.js`, `api/health.js`) share the exact same validation and email routing engine ([`lib/email.js`](lib/email.js)) as the Docker backend.

---

## 2. Running with Docker (Frontend `3002` / Backend `8082`)

1. Copy `.env.example` to `.env` and populate your email credentials (or leave blank to test with local console logging):
   ```bash
   cp .env.example .env
   ```
2. Build and start both containers:
   ```bash
   docker compose up --build -d
   ```
3. Verify the services:
   - **Frontend UI:** `http://localhost:3002`
   - **Backend API Root:** `http://localhost:8082`
   - **Health Check:** `http://localhost:8082/api/health` (or via frontend proxy at `http://localhost:3002/api/health`)

---

## 3. Email Routing Setup (`contact@najialess.io`)

Both the consultation form (`POST /api/contact`) and inbound webhook (`POST /api/inbound-email`) route through [`lib/email.js`](lib/email.js).

### Outbound Form Dispatch (Choose Option A or B)
- **Option A — Resend HTTP API (Recommended for Vercel):**
  1. Verify `najialess.io` in Resend (adds DKIM/SPF DNS records).
  2. Set `RESEND_API_KEY=re_...` and `EMAIL_FROM="Arx Tessera Dispatch <contact@najialess.io>"`.
  3. Set `CONTACT_RECIPIENT_EMAIL=contact@najialess.io`.
- **Option B — Standard SMTP (Google Workspace, Postmark, AWS SES, etc.):**
  1. Set `SMTP_HOST`, `SMTP_PORT` (`587` or `465`), `SMTP_SECURE` (`false` or `true`), `SMTP_USER`, and `SMTP_PASS`.

### Inbound Email Routing (`@najialess.io` -> Your Inbox / Webhook)
- **Cloudflare Email Routing / Resend Inbound:**
  - Point `najialess.io` MX records to Cloudflare Email Routing or Resend.
  - Forward `contact@najialess.io` directly to your personal partner inbox, **or** point an Email Webhook to `https://najialess.io/api/inbound-email` with header `X-Webhook-Secret: <INBOUND_WEBHOOK_SECRET>`.

---

## 4. Deploying to Vercel

1. Install Vercel CLI or connect your Git repository on the Vercel Dashboard.
2. Add Environment Variables in **Vercel Project Settings -> Environment Variables**:
   - `CONTACT_RECIPIENT_EMAIL` = `contact@najialess.io`
   - `EMAIL_FROM` = `Arx Tessera Dispatch <contact@najialess.io>`
   - `RESEND_API_KEY` = `re_xxxxxxxxx` (or `SMTP_*` variables)
3. Deploy:
   ```bash
   npx vercel --prod
   ```

