/**
 * SePay Payment Gateway API helpers.
 * Docs: https://developer.sepay.vn
 */

import { SePayPgClient } from 'sepay-pg-node';

export type SepayPaymentMethod = 'BANK_TRANSFER' | 'NAPAS_BANK_TRANSFER';

export interface InitCheckoutParams {
  orderInvoiceNumber: string;
  orderAmount: number;
  currency?: string;
  orderDescription?: string;
  successUrl: string;
  errorUrl?: string;
  cancelUrl?: string;
  paymentMethod?: SepayPaymentMethod;
  customData?: string;
}

export interface InitCheckoutResult {
  checkoutUrl: string;
  formFields: Record<string, string>;
}

/**
 * Create SePay client. Requires SEPAY_MERCHANT_ID and SEPAY_SECRET_KEY.
 */
function getClient(): SePayPgClient {
  const merchantId = process.env.SEPAY_MERCHANT_ID;
  const secretKey = process.env.SEPAY_SECRET_KEY;
  const env = (process.env.SEPAY_ENV || 'sandbox') as 'sandbox' | 'production';

  if (!merchantId || !secretKey) {
    throw new Error('SePay: SEPAY_MERCHANT_ID and SEPAY_SECRET_KEY must be set');
  }

  return new SePayPgClient({
    env,
    merchant_id: merchantId,
    secret_key: secretKey,
  });
}

/**
 * Initialize checkout for one-time payment. Returns URL and form fields for redirect.
 */
export function initCheckout(params: InitCheckoutParams): InitCheckoutResult {
  const client = getClient();
  const checkoutUrl = client.checkout.initCheckoutUrl();

  const fields = client.checkout.initOneTimePaymentFields({
    operation: 'PURCHASE',
    payment_method: params.paymentMethod || 'BANK_TRANSFER',
    order_invoice_number: params.orderInvoiceNumber,
    order_amount: params.orderAmount,
    currency: params.currency || 'VND',
    order_description: params.orderDescription || `Order ${params.orderInvoiceNumber}`,
    success_url: params.successUrl,
    error_url: params.errorUrl,
    cancel_url: params.cancelUrl,
    ...(params.customData && { custom_data: params.customData }),
  });

  // Convert all values to strings for form submission
  const formFields: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined && v !== null) {
      formFields[k] = String(v);
    }
  }

  return { checkoutUrl, formFields };
}

/**
 * SePay IPN payload (Instant Payment Notification).
 */
export interface SepayIpnPayload {
  timestamp?: number;
  notification_type?: string;
  order?: {
    id?: string;
    order_id?: string;
    order_status?: string;
    order_currency?: string;
    order_amount?: string;
    order_invoice_number?: string;
    custom_data?: unknown[];
  };
  transaction?: {
    id?: string;
    transaction_id?: string;
    transaction_status?: string;
    transaction_amount?: string;
    payment_method?: string;
  };
}

/**
 * Verify IPN signature if SePay sends one. For now we rely on HTTPS and order_invoice_number matching.
 * SePay IPN docs: https://developer.sepay.vn/en/cong-thanh-toan/IPN
 */
export function parseIpnPayload(body: unknown): SepayIpnPayload | null {
  if (!body || typeof body !== 'object') return null;
  return body as SepayIpnPayload;
}
