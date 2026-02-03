# Project Structure

```
hospital-testing-service/
│
├── database/
│   └── schema.sql                    # PostgreSQL database schema
│
├── n8n-workflows/                    # n8n workflow definitions
│   ├── check-in.json                 # Patient check-in workflow
│   ├── procedure-selection.json      # Procedure listing & selection
│   ├── payment.json                  # Stripe payment processing
│   ├── email-confirmation.json       # Email sending workflow
│   ├── status-update.json            # Order status updates
│   ├── worker-orders.json            # Worker dashboard API
│   └── order-status.json             # Order status polling endpoint
│
├── frontend/                         # Patient-facing Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root layout with Google OAuth
│   │   │   ├── page.tsx              # Main patient flow
│   │   │   └── globals.css           # Global styles
│   │   └── components/
│   │       ├── CheckIn.tsx            # QR scan & Google sign-in
│   │       ├── ProcedureSelection.tsx # Procedure selection UI
│   │       ├── Payment.tsx           # Stripe payment form
│   │       └── OrderStatus.tsx       # Status display with polling
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── worker-dashboard/                # Staff-facing Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # Dashboard main page
│   │   │   └── globals.css
│   │   └── components/
│   │       └── OrderList.tsx         # Order management table
│   ├── package.json
│   ├── next.config.js
│   └── tsconfig.json
│
├── README.md                         # Main project documentation
├── SETUP.md                          # Detailed setup guide
├── QUICK_START.md                    # Quick start guide
├── CV_DESCRIPTION.md                 # CV-ready project description
├── PROJECT_STRUCTURE.md               # This file
└── .gitignore                        # Git ignore rules

```

## Workflow Flow

```
Patient Flow:
QR Scan → Google Sign-In → Select Procedure → Payment → Email Confirmation → 
Status Updates → Audio Guidance → Test Completion

Worker Flow:
View Orders → Filter by Status → Start Test → Mark Completed → 
Patient Notified Automatically
```

## API Endpoints (n8n Webhooks)

### Patient Endpoints
- `POST /check-in` - Patient check-in with Google OAuth
- `GET /procedures` - List available procedures
- `POST /select-procedure` - Create order for selected procedure
- `POST /process-payment` - Process Stripe payment
- `GET /order-status` - Get current order status (polling)

### Worker Endpoints
- `GET /worker-orders` - List all orders (with optional status filter)
- `POST /update-status` - Update order status (in_progress, completed)

### Email Endpoint
- `POST /send-confirmation` - Send order confirmation email

## Database Tables

- `users` - Patient information
- `procedures` - Available medical procedures
- `orders` - Patient orders/appointments
- `workers` - Staff members
- `order_updates` - Status change audit log

## Key Files to Customize

1. **Database**: `database/schema.sql` - Add/modify procedures
2. **Workflows**: `n8n-workflows/*.json` - Import and configure in n8n
3. **Frontend**: `frontend/src/app/page.tsx` - Main patient flow
4. **Worker Dashboard**: `worker-dashboard/src/components/OrderList.tsx` - Order management

## Environment Variables

### Frontend
- `NEXT_PUBLIC_N8N_WEBHOOK_URL` - Base URL for n8n webhooks
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

### Worker Dashboard
- `NEXT_PUBLIC_N8N_WEBHOOK_URL` - Base URL for n8n webhooks

### n8n (configured in n8n UI)
- PostgreSQL credentials
- Stripe API credentials
- SMTP credentials
