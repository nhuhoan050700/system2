import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/** POST - Update user profile (name, birthday, phone, address). Proxies to n8n update-profile webhook → Railway DB. */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { user_id, name, birthday, phone, address } = body as { user_id?: number; name?: string; birthday?: string | null; phone?: string | null; address?: string | null }

    if (typeof user_id !== 'number' || !user_id) {
      return NextResponse.json({ success: false, error: 'user_id required' }, { status: 400 })
    }

    const n8nBase = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || ''
    if (!n8nBase) {
      return NextResponse.json({ success: false, error: 'N8N webhook URL not configured' }, { status: 500 })
    }

    const n8nRes = await fetch(`${n8nBase}/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id,
        name: typeof name === 'string' ? name : undefined,
        birthday: birthday && String(birthday).trim() ? String(birthday).trim() : null,
        phone: phone !== undefined && phone !== null ? String(phone) : null,
        address: address !== undefined && address !== null ? String(address).trim() || null : null,
      }),
    })

    const data = await n8nRes.json().catch(() => ({}))
    if (!n8nRes.ok || !data?.success) {
      console.error('[profile] n8n status:', n8nRes.status, 'body:', JSON.stringify(data))
      return NextResponse.json(data?.error ? { success: false, error: data.error } : data, { status: n8nRes.status })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[profile] error', err)
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 })
  }
}
