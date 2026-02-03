# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Database (Railway) - 2 minutes
```bash
# Create PostgreSQL on Railway
# Copy connection string
# Run schema.sql in Railway SQL editor
```

### 2. n8n - 2 minutes
```bash
# Option A: Self-hosted (port 7035)
npm install n8n -g
.\start-n8n.bat
# Or: set N8N_PORT=7035 && n8n start

# Option B: Use n8n.cloud
# Sign up and create workspace
```
n8n runs at **http://localhost:7035**

**Configure:**
- PostgreSQL credential (Railway connection)
- Stripe credential (test key)
- SMTP credential (Gmail)

**Import workflows:**
- Import all JSON files from `n8n-workflows/`
- Activate workflows
- Copy webhook base URL

### 3. Frontend - 1 minute
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your values
npm run dev
```

### 4. Worker Dashboard - 1 minute
```bash
cd worker-dashboard
npm install
cp .env.example .env.local
# Edit .env.local with n8n webhook URL
npm run dev
```

## 📋 Environment Variables Checklist

### Frontend `.env.local`
```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:7035/webhook
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Worker Dashboard `.env.local`
```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:7035/webhook
```

## 🧪 Test Flow

1. **Patient**: `http://localhost:7030`
   - Sign in with Google
   - Select procedure
   - Pay with test card: `4242 4242 4242 4242`

2. **Worker**: `http://localhost:7032`
   - See order appear
   - Click "Start Test"
   - Patient hears audio 🔊
   - Click "Mark Completed"
   - Patient sees update ✅

## 🔧 Common Issues

**Database connection fails?**
- Check Railway database is running
- Verify connection string format

**n8n webhook 404?**
- Ensure workflow is activated
- Check webhook path matches

**Google OAuth error?**
- Verify redirect URI matches exactly
- Check Client ID is correct

**Stripe payment fails?**
- Use test mode keys only
- Test card: `4242 4242 4242 4242`

## 📚 Full Documentation

See `SETUP.md` for detailed setup instructions.
