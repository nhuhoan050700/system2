import { NextResponse } from 'next/server';
import { parseIpnPayload } from '@/lib/sepay';

export const dynamic = 'force-dynamic';

/**
 * POST - SePay IPN (Instant Payment Notification) webhook.
 * SePay calls this when a payment is completed. We forward to n8n to update orders.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload = parseIpnPayload(body);

    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    if (payload.notification_type !== 'ORDER_PAID') {
      return NextResponse.json({ success: true, message: 'Ignored' }, { status: 200 });
    }

    const invoiceNumber = payload.order?.order_invoice_number;
    if (!invoiceNumber) {
      return NextResponse.json({ success: false, error: 'Missing order_invoice_number' }, { status: 400 });
    }

    const n8nBase = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '';
    if (!n8nBase) {
      console.error('[sepay/ipn] N8N webhook URL not configured');
      return NextResponse.json({ success: false, error: 'Server misconfigured' }, { status: 500 });
    }

    // Forward to n8n sepay-ipn workflow
    const n8nRes = await fetch(`${n8nBase}/sepay-ipn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_invoice_number: invoiceNumber,
        order_status: payload.order?.order_status,
        transaction_id: payload.transaction?.transaction_id,
        amount: payload.order?.order_amount,
        currency: payload.order?.order_currency,
        raw: payload,
      }),
    });

    const data = await n8nRes.json().catch(() => ({}));

    if (!n8nRes.ok) {
      console.error('[sepay/ipn] n8n error:', n8nRes.status, data);
      return NextResponse.json({ success: false, error: 'Processing failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[sepay/ipn]', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
