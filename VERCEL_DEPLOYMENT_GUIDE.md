# Vercel Production Deployment Guide — Arx Tessera (najialess.io)

This repository is pre-configured and 100% ready to deploy to Vercel with zero build configuration. Static assets deploy across Vercel's Edge CDN, and backend API routes deploy automatically as Node.js Serverless Functions.

---

## 1. Quick Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub / GitLab / Bitbucket**:
   ```bash
   git add .
   git commit -m "Prepare production deployment for Vercel"
   git push origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your repository (`ark` / `arx-tessera`).
   - Framework Preset: **Other** (leave default; Vercel automatically detects static HTML + `api/` serverless functions).
   - Root Directory: `./` (leave default).
   - Build Command: *(Leave blank)*.
   - Output Directory: *(Leave blank)*.

3. **Configure Environment Variables** (in Vercel Project Settings → Environment Variables):

   | Variable Name | Required | Example / Recommended Value | Description |
   | :--- | :---: | :--- | :--- |
   | `CONTACT_RECIPIENT_EMAIL` | Yes | `alessionaji1@gmail.com` | Where consultation inquiries are delivered. |
   | `EMAIL_FROM` | Yes | `Arx Tessera Dispatch <onboarding@resend.dev>` or `Alessio <alessio@najialess.io>` | Sender identity on outgoing emails. |
   | `RESEND_API_KEY` | Optional* | `re_123456789...` | *Option A: Resend API Key for serverless email dispatch. |
   | `SMTP_HOST` | Optional* | `smtp.gmail.com` | *Option B: SMTP Host (Gmail / Google Workspace). |
   | `SMTP_PORT` | Optional* | `587` | SMTP Port. |
   | `SMTP_USER` | Optional* | `alessionaji1@gmail.com` | SMTP Username. |
   | `SMTP_PASS` | Optional* | `xxxx xxxx xxxx xxxx` | Google App Password (16 letters, no spaces). |
   | `INBOUND_WEBHOOK_SECRET` | Optional | `whsec_random_string` | Secret key for `/api/inbound-email` webhooks. |

   *\*Note: Set either `RESEND_API_KEY` or `SMTP_*` credentials. If neither is set, inquiries will log safely to Vercel Function logs.*

4. **Click Deploy**:
   - Your site will deploy in ~15–30 seconds.

---

## 2. Deploy via Vercel CLI (Alternative)

If you prefer deploying from your terminal:

```bash
# 1. Log in to Vercel
npx vercel login

# 2. Preview Deployment
npx vercel

# 3. Production Deployment
npx vercel --prod
```

---

## 3. Custom Domain Configuration (`najialess.io`)

1. In the Vercel Dashboard, go to **Settings → Domains**.
2. Add `najialess.io` and `www.najialess.io`.
3. Set your DNS records at your domain registrar (GoDaddy, Namecheap, Cloudflare, Google Domains):
   - **Apex Domain (`najialess.io`)**:
     - Type: `A`
     - Name: `@`
     - Value: `76.76.21.21`
   - **Subdomain (`www.najialess.io`)**:
     - Type: `CNAME`
     - Name: `www`
     - Value: `cname.vercel-dns.com`
4. Vercel will automatically provision a free SSL certificate within 2–5 minutes.

---

## 4. Architecture & Included Vercel Optimizations

- **Static Edge Delivery**: `index.html`, `founder.html`, `testimonials.html`, `privacy.html`, `terms.html`, and `404.html` are served globally from Vercel's Edge CDN with instant cache invalidation on deployment.
- **Serverless API Routes (`/api`)**:
  - `POST /api/contact`: Form submission and automated notification dispatch with honeypot bot filtering.
  - `GET /api/health`: Health monitoring endpoint checking email configuration status.
  - `POST /api/inbound-email`: Webhook endpoint for inbound email processing.
- **Security Headers Included**: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.
- **Clean URLs Enabled**: Automatically maps `/founder` to `founder.html` and `/testimonials` to `testimonials.html` without `.html` extensions.
- **SEO Ready**: `sitemap.xml` and `robots.txt` are included at the root.
- **Lean Ignore List**: `.vercelignore` excludes Docker files, Nginx configs, local test scripts, and local logs from the production bundle.

