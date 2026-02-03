/**
 * Pay2s (Pay2.House) API helpers.
 * Docs: https://pay2.house/docs/api
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const PAY2S_API_BASE = 'https://pay2.house/api';

export type Pay2sPaymentMethod = 'PAY2_HOUSE' | 'USDT_TRC20' | 'CARDS' | 'ALL';

export interface CreatePaymentParams {
  external_number: string;
  amount: number;
  currency_code: string;
  merchant_id: string;
  description: string;
  deadline_seconds: number;
  return_url: string;
  cancel_url: string;
  payment_method?: Pay2sPaymentMethod;
  handling_fee?: number;
  payer_email?: string;
}

export interface CreatePaymentResult {
  status: string;
  code?: string;
  invoice_number?: string;
  approval_url?: string;
  msg?: string;
}

export interface WebhookPayload {
  invoice_number?: string;
  external_number?: string;
  amount?: number;
  handling_fee?: number;
  currency_code?: string;
  description?: string;
  status?: string;
}

/**
 * Create JWT sign_token for Pay2.House API (RS256).
 * Requires PAY2S_KEY_ID and PAY2S_PRIVATE_KEY (PEM string).
 */
function createSignToken(data: Record<string, unknown>, keyId: string, privateKeyPem: string): string {
  const payload = {
    iss: keyId,
    iat: Math.floor(Date.now() / 1000),
    data,
  };
  return jwt.sign(payload, privateKeyPem, { algorithm: 'RS256' });
}

/**
 * Create a payment and return approval_url for redirect.
 */
export async function createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
  const apiKey = process.env.PAY2S_API_KEY;
  const keyId = process.env.PAY2S_KEY_ID;
  const privateKeyPem = process.env.PAY2S_PRIVATE_KEY;

  if (!apiKey || !keyId || !privateKeyPem) {
    throw new Error('Pay2s: PAY2S_API_KEY, PAY2S_KEY_ID, and PAY2S_PRIVATE_KEY must be set');
  }

  const signToken = createSignToken(
    {
      external_number: params.external_number,
      amount: params.amount,
      currency_code: params.currency_code,
      merchant_id: params.merchant_id,
      description: params.description,
      deadline_seconds: params.deadline_seconds,
      return_url: params.return_url,
      cancel_url: params.cancel_url,
      payment_method: params.payment_method ?? 'ALL',
      ...(params.handling_fee != null && { handling_fee: params.handling_fee }),
      ...(params.payer_email && { payer_email: params.payer_email }),
    },
    keyId,
    privateKeyPem
  );

  const body = new URLSearchParams({
    sign_token: signToken,
    api_key: apiKey,
  });

  const res = await fetch(`${PAY2S_API_BASE}/create_payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = (await res.json().catch(() => ({}))) as CreatePaymentResult;
  if (!res.ok) {
    throw new Error(data.msg || `Pay2s API error: ${res.status}`);
  }
  return data;
}

/**
 * Verify and decrypt Pay2.House webhook signature (Pay2-House-Signature header).
 * Returns decoded payload or null if invalid.
 */
export function verifyWebhook(signatureHeader: string | null, apiKey: string): WebhookPayload | null {
  if (!signatureHeader || !apiKey) return null;

  try {
    const decoded = Buffer.from(signatureHeader, 'base64').toString('utf8');
    const parts = decoded.split('|');
    if (parts.length !== 3) return null;
    const [ivHex, signature, encryptedB64] = parts;

    const encryptedData = encryptedB64; // keep as base64 for HMAC input
    const encryptedBuffer = Buffer.from(encryptedB64, 'base64');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.createHash('sha256').update(apiKey).digest();

    const hmacPayload = `${ivHex}|${encryptedData}`;
    const expectedSig = crypto.createHmac('sha256', apiKey).update(hmacPayload).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), expectedSig)) {
      return null;
    }

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]).toString('utf8');
    return JSON.parse(decrypted) as WebhookPayload;
  } catch {
    return null;
  }
}
