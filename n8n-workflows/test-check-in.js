/**
 * Send a test POST to the n8n check-in webhook (test URL).
 * Use this while the workflow is open in the n8n editor to see the execution.
 *
 * Run: node test-check-in.js
 */

const TEST_URL = 'https://nhuhoang.app.n8n.cloud/webhook-test/check-in';

const testPayload = {
  google_id: 'test-google-id-123',
  email: 'test@example.com',
  name: 'Test User',
};

async function sendTestEvent() {
  try {
    const res = await fetch(TEST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
    });
    const data = await res.json().catch(() => res.text());
    console.log('Status:', res.status);
    console.log('Response:', typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  } catch (err) {
    console.error('Request failed:', err.message);
  }
}

sendTestEvent();
