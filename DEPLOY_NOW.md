# Deploy Now – Step-by-Step

Follow these steps to get your app live on the internet.

---

## Prerequisites

- [ ] GitHub account
- [ ] Vercel account (free at [vercel.com](https://vercel.com))
- [ ] n8n Cloud (you have: nhuhoang.app.n8n.cloud)
- [ ] Railway PostgreSQL (or other Postgres)
- [ ] Google OAuth client ID

---

## Step 1: Push Code to GitHub

```bash
cd d:\system2

# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. **Import** your GitHub repository
3. **Root Directory**: set to `frontend` (click Edit)
4. **Environment Variables** – add these (Production + Preview):

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_N8N_WEBHOOK_URL` | `https://nhuhoang.app.n8n.cloud/webhook` |
   | `NEXT_PUBLIC_APP_URL` | *(leave empty for now – set after first deploy)* |
   | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `844537691318-6ulqiavv8g1hkemq3n9sd9p28r8m7cl3.apps.googleusercontent.com` |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Your Stripe key |
   | `SEPAY_MERCHANT_ID` | `SP-TEST-HC2293B5` |
   | `SEPAY_SECRET_KEY` | Your SePay secret key |
   | `SEPAY_ENV` | `sandbox` |

5. Click **Deploy**
6. After deploy, copy the URL (e.g. `https://system2-xxx.vercel.app`)
7. Go to **Settings** → **Environment Variables** → add:
   - `NEXT_PUBLIC_APP_URL` = `https://your-actual-url.vercel.app`
   - Redeploy (Deployments → ⋮ → Redeploy)

---

## Step 3: Deploy Worker Dashboard

1. **Add New** → **Project** again
2. Import the **same** repository
3. **Root Directory**: set to `worker-dashboard`
4. **Environment Variables**:
   - `NEXT_PUBLIC_N8N_WEBHOOK_URL` = `https://nhuhoang.app.n8n.cloud/webhook`
5. Click **Deploy**

---

## Step 4: Configure SePay IPN

In [my.sepay.vn](https://my.sepay.vn) → Payment Gateway → IPN config:

```
https://YOUR-FRONTEND-URL.vercel.app/api/payment/sepay/ipn
```

Example: `https://system2-abc123.vercel.app/api/payment/sepay/ipn`

---

## Step 5: Configure Google OAuth

In [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → your OAuth client:

**Authorized JavaScript origins:**
- `https://YOUR-FRONTEND-URL.vercel.app`
- `https://YOUR-WORKER-DASHBOARD-URL.vercel.app`

**Authorized redirect URIs:**
- `https://YOUR-FRONTEND-URL.vercel.app`
- `https://YOUR-WORKER-DASHBOARD-URL.vercel.app`

---

## Step 6: Ensure n8n Workflows Are Active

In n8n (nhuhoang.app.n8n.cloud):

- [ ] All workflows imported from `n8n-workflows/`
- [ ] Postgres credentials set on each workflow
- [ ] `sepay-ipn` workflow **Active**
- [ ] Test: open `https://nhuhoang.app.n8n.cloud/webhook/procedures` – should return JSON

---

## Quick Deploy via CLI (Alternative)

If you prefer command line:

```bash
cd d:\system2\frontend
npx vercel login
npx vercel --prod
```

Then deploy worker-dashboard:

```bash
cd d:\system2\worker-dashboard
npx vercel --prod
```

---

## Done!

- **Frontend (patients):** `https://xxx.vercel.app`
- **Worker dashboard (staff):** `https://yyy.vercel.app`

Test the flow: check-in → procedure → pay with SePay or Stripe → confirm in worker dashboard.
