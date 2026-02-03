# Deploy to Vercel – nhuhoan050700

## Option A: Deploy via Vercel Dashboard (recommended)

Follow steps 1–6 below. Easiest: push to GitHub, then connect the repo in [vercel.com](https://vercel.com).

## Option B: Deploy via CLI

```powershell
vercel login
cd d:\system2\frontend
vercel
```

Then deploy worker-dashboard:
```powershell
cd d:\system2\worker-dashboard
vercel
```

---

## 1. Push to GitHub

```powershell
cd d:\system2
git init
git add .
git commit -m "Initial deploy"
git branch -M main
git remote add origin https://github.com/nhuhoan050700/system2.git
git push -u origin main
```

If the repo already exists, just push:
```powershell
git add .
git commit -m "Prepare for Vercel deploy"
git push
```

## 2. Deploy Frontend (Patient App)

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import `nhuhoan050700/system2` (or your repo)
3. **Configure project:**
   - **Root Directory:** `frontend` ← click Edit, enter `frontend`
   - **Framework:** Next.js (auto-detected)
4. **Environment Variables** (add these for Production):

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_N8N_WEBHOOK_URL` | `https://nhuhoang.app.n8n.cloud/webhook` |
| `NEXT_PUBLIC_APP_URL` | *(leave empty – Vercel sets it automatically)* |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `844537691318-6ulqiavv8g1hkemq3n9sd9p28r8m7cl3.apps.googleusercontent.com` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_51Su52K0iTKjoShabAGp8mcQA0IW0WdcJ9Gx75QMmha0HC55mNezsaPAMiaWxJfvSasfY4ANzHgB5CUbf3FChVOMh00y3r3KoaX` |
| `SEPAY_MERCHANT_ID` | `SP-TEST-HC2293B5` |
| `SEPAY_SECRET_KEY` | `spsk_test_NSxUc7bd5LCzwmzQkwQQGDvANr8piG6P` |
| `SEPAY_ENV` | `sandbox` |

5. **Deploy**. You’ll get a URL like `https://system2-xxx.vercel.app`.

## 3. Deploy Worker Dashboard (Staff App)

1. **Add New** → **Project** (same repo)
2. **Configure:**
   - **Root Directory:** `worker-dashboard`
3. **Environment Variables:**

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_N8N_WEBHOOK_URL` | `https://nhuhoang.app.n8n.cloud/webhook` |

4. **Deploy**. You’ll get a URL like `https://system2-worker-xxx.vercel.app`.

## 4. Google OAuth – Add Vercel URLs

In [Google Cloud Console](https://console.cloud.google.com) → Credentials → your OAuth client:

- **Authorized JavaScript origins:**
  - `https://YOUR-FRONTEND-URL.vercel.app`
  - `http://localhost:7030`
- **Authorized redirect URIs:**
  - `https://YOUR-FRONTEND-URL.vercel.app`
  - `http://localhost:7030`

## 5. SePay IPN – Add Production URL

After the frontend is deployed, in SePay dashboard set the IPN URL to:

```
https://YOUR-FRONTEND-URL.vercel.app/api/payment/sepay/ipn
```

Replace `YOUR-FRONTEND-URL` with your actual Vercel frontend URL.

## 6. n8n – Import `sepay-ipn` Workflow

If not done yet:

1. In n8n: Workflows → Import → select `n8n-workflows/sepay-ipn.json`
2. Set PostgreSQL credentials on the Postgres node
3. Activate the workflow

---

## Quick Test

1. Open the frontend Vercel URL → Sign in with Google → select procedure → pay with SePay or card.
2. Open the worker dashboard URL → confirm orders appear and status updates work.
