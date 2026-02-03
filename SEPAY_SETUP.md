# SePay VietQR Bank Transfer Setup

This guide explains how to set up SePay for VietQR bank transfer payments (replacing Pay2S/Payos).

## 1. Register SePay Account

- **Production:** [https://my.sepay.vn/register](https://my.sepay.vn/register)
- **Sandbox (testing):** [https://my.dev.sepay.vn/register](https://my.dev.sepay.vn/register)

## 2. Activate Payment Gateway

1. Go to **Payment Gateway** → **Register**
2. Select **Bank Transfer via QR Code** → **Get Started**
3. Copy your **MERCHANT ID** and **SECRET KEY**

## 3. Configure IPN URL

In the SePay integration screen, set the **IPN (Instant Payment Notification) URL** to:

```
https://your-domain.com/api/payment/sepay/ipn
```

For local development, use a tunnel (e.g. ngrok):

```
https://your-ngrok-url.ngrok.io/api/payment/sepay/ipn
```

## 4. Environment Variables

Add to `frontend/.env.local`:

```env
SEPAY_MERCHANT_ID=your_merchant_id
SEPAY_SECRET_KEY=your_secret_key
SEPAY_ENV=sandbox
SEPAY_CURRENCY=VND
SEPAY_USD_TO_VND_RATE=25000
NEXT_PUBLIC_APP_URL=http://localhost:7030
```

- `SEPAY_ENV`: `sandbox` for testing, `production` for live
- `SEPAY_CURRENCY`: `VND` or `USD` (default VND)
- `SEPAY_USD_TO_VND_RATE`: Conversion rate if procedures are in USD (default 25000)

## 5. Import n8n Workflow

1. In n8n: **Workflows** → **Import from File** → select `n8n-workflows/sepay-ipn.json`
2. Set **PostgreSQL** credentials on the Postgres node
3. Activate the workflow
4. The webhook path is `sepay-ipn` – full URL: `{NEXT_PUBLIC_N8N_WEBHOOK_URL}/sepay-ipn`

## 6. Go Live

When ready for production:

1. In SePay dashboard, click **Switch to Production**
2. Link your real bank account
3. Update `.env`:
   - `SEPAY_ENV=production`
   - Replace with production MERCHANT ID and SECRET KEY
4. Update IPN URL to your production domain

## Flow

1. User selects **SePay (VietQR)** on the payment screen
2. Frontend calls `/api/payment/sepay/init` → receives checkout URL and form fields
3. User is redirected to SePay gateway → scans VietQR with banking app
4. SePay sends IPN to `/api/payment/sepay/ipn`
5. API forwards to n8n `sepay-ipn` workflow → updates order to `paid`

## Supported Banks

SePay supports Vietcombank, Vietinbank, Techcombank, BIDV, ACB, MB Bank, VPBank, TPBank, OCB, and more.
