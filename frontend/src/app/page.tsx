'use client'

import { useState, useEffect, useCallback } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import type { Procedure } from '@/components/ProcedureSelection'
import CheckIn from '@/components/CheckIn'
import ProcedureSelection from '@/components/ProcedureSelection'
import Payment from '@/components/Payment'
import OrderStatus from '@/components/OrderStatus'
import ProfileModal from '@/components/ProfileModal'

type User = {
  id: number
  email: string
  name: string
  birthday?: string
  phone?: string
  address?: string
}

type Order = {
  id: number
  order_number: string
  queue_number: string
  room_number: string
  status: string
  total_amount: number
  procedure_name?: string
}

async function completeCheckIn(
  accessToken: string,
  setUser: (u: User) => void,
  setSessionToken: (t: string | null) => void,
  setStep: (s: 'checkin' | 'procedure' | 'payment' | 'status') => void
) {
  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  if (!userInfoResponse.ok) {
    alert('Could not fetch Google profile. Check console.')
    return
  }
  const userInfo = await userInfoResponse.json()

  const checkInResponse = await fetch('/api/check-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      google_id: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
    })
  })
  const checkInData = await checkInResponse.json().catch(() => null)

  const u = checkInData?.user
  if (checkInData?.success && u && typeof u.id === 'number') {
    setUser({ id: u.id, email: u.email || '', name: u.name || '', birthday: u.birthday ?? undefined, phone: u.phone, address: u.address ?? undefined })
    setSessionToken(checkInData.sessionToken ?? null)
    if (typeof window !== 'undefined') {
      try {
        const saved = { id: u.id, email: u.email || '', name: u.name || '', birthday: u.birthday ?? undefined, phone: u.phone, address: u.address ?? undefined }
        localStorage.setItem('checkin_user', JSON.stringify(saved))
        if (checkInData.sessionToken) localStorage.setItem('checkin_session', checkInData.sessionToken)
      } catch (_) {}
    }
    setStep('procedure')
  } else {
    const msg =
      !u || typeof u?.id !== 'number'
        ? 'Check-in succeeded but user data was missing.'
        : checkInData?.message || checkInData?.error || (!checkInResponse.ok ? `Check-in failed (${checkInResponse.status}).` : 'Check-in failed.')
    alert(msg)
  }
}

const STEP_TITLES: Record<string, string> = {
  checkin: 'Check in',
  procedure: 'Procedures',
  payment: 'Payment',
  status: 'Your visit',
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [cart, setCart] = useState<Procedure[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [checkoutProcedures, setCheckoutProcedures] = useState<Procedure[]>([])
  const [step, setStep] = useState<'checkin' | 'procedure' | 'payment' | 'status'>('checkin')
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = localStorage.getItem('checkin_user')
      if (stored) {
        const u = JSON.parse(stored) as User
        setUser(u)
        if (step === 'checkin') setStep('procedure')
      }
    } catch (_) {}
  }, [])

  const n8nUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || ''
  const hasClientId = !!(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').trim()

  const doCheckIn = useCallback(async (accessToken: string) => {
    try {
      await completeCheckIn(accessToken, setUser, setSessionToken, setStep)
    } catch (e) {
      console.error('Sign-in error:', e)
      alert('Sign-in error: ' + (e instanceof Error ? e.message : 'Unknown'))
    }
  }, [])

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    prompt: 'select_account',
    onSuccess: async (tokenResponse) => { await doCheckIn(tokenResponse.access_token) },
    onError: (err) => {
      console.error('Google sign-in error:', err)
      alert('Google sign-in failed. Allow popups and try again.')
    }
  })

  const googleLoginRedirect = useGoogleLogin({
    flow: 'implicit',
    prompt: 'select_account',
    onSuccess: async (tokenResponse) => { await doCheckIn(tokenResponse.access_token) },
    onError: (err) => {
      console.error('Google sign-in error:', err)
      alert('Google sign-in failed.')
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.hash) return
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    if (accessToken) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      doCheckIn(accessToken)
    }
  }, [doCheckIn])

  const handleAddToCart = (procedure: Procedure) => {
    setCart((prev) => (prev.some((p) => p.id === procedure.id) ? prev : [...prev, procedure]))
  }

  const handleRemoveFromCart = (procedure: Procedure) => {
    setCart((prev) => prev.filter((p) => p.id !== procedure.id))
  }

  const handleCheckout = async (procedures: Procedure[]) => {
    if (!n8nUrl) {
      alert('Missing n8n webhook URL. Set NEXT_PUBLIC_N8N_WEBHOOK_URL.')
      return
    }
    if (!user?.id || procedures.length === 0) return

    const createdOrders: Order[] = []
    for (const proc of procedures) {
      const response = await fetch(`${n8nUrl}/select-procedure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, procedure_id: proc.id, room_number: proc.room })
      })
      const text = await response.text()
      const data = text ? (() => { try { return JSON.parse(text); } catch { return {}; } })() : {}
      if (data.success && data.order) {
        createdOrders.push(data.order)
      } else {
        alert(`Failed to create order for ${proc.name}. Check Procedure Selection workflow.`)
        return
      }
    }
    setOrders(createdOrders)
    setCheckoutProcedures(procedures)
    setCart([])
    setStep('payment')
  }

  const handlePaymentSuccess = () => setStep('status')

  useEffect(() => {
    if (step !== 'status' || orders.length === 0) return
    const interval = setInterval(async () => {
      const n8nUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || ''
      try {
        const updates: Order[] = []
        let changed = false
        for (const o of orders) {
          const response = await fetch(`${n8nUrl}/order-status?order_id=${o.id}`)
          const text = await response.text()
          const data = text ? (() => { try { return JSON.parse(text); } catch { return {}; } })() : {}
          if (data.success && data.order) {
            updates.push(data.order)
            if (data.order.status !== o.status) {
              changed = true
              if (data.order.status === 'in_progress' || data.order.status === 'completed') {
                const utterance = new SpeechSynthesisUtterance(
                  data.order.status === 'in_progress'
                    ? `Please proceed to ${data.order.room_number}. Queue number ${data.order.queue_number}.`
                    : 'Your test has been completed. Thank you!'
                )
                window.speechSynthesis.speak(utterance)
              }
            }
          } else {
            updates.push(o)
          }
        }
        if (changed) setOrders(updates)
      } catch (e) {
        console.error('Order status error:', e)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [step, orders])

  const showBottomBar = step === 'procedure' && cart.length > 0
  const showAvatar = user && step !== 'checkin'
  const initial = user?.name?.trim().charAt(0)?.toUpperCase() || '?'

  const handleProfileSave = useCallback((updated: User) => {
    setUser(updated)
    try {
      localStorage.setItem('checkin_user', JSON.stringify(updated))
    } catch (_) {}
  }, [])

  return (
    <div className="h-dvh max-h-dvh bg-gray-50 flex flex-col max-w-app mx-auto overflow-hidden">
      {/* App header */}
      <header className="flex-shrink-0 z-30 bg-white border-b border-gray-200 px-4 py-3 pt-safe flex items-center justify-center relative">
        <h1 className="text-lg font-semibold text-gray-900">
          {STEP_TITLES[step]}
        </h1>
        {showAvatar && (
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            aria-label="Open profile"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-semibold text-lg flex items-center justify-center touch-target active:bg-blue-200"
          >
            {initial}
          </button>
        )}
      </header>

      {user && (
        <ProfileModal
          user={user}
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          onSave={handleProfileSave}
          onSignOut={() => {
            setUser(null)
            setSessionToken(null)
            setCart([])
            setProfileOpen(false)
            try {
              localStorage.removeItem('checkin_user')
              localStorage.removeItem('checkin_session')
            } catch (_) {}
            setStep('checkin')
          }}
        />
      )}

      {/* Main content - scrollable area */}
      <main className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden ${showBottomBar ? 'pb-24' : 'pb-6'}`}>
        <div className="px-4 py-4">
          {step === 'checkin' && (
            <CheckIn
              onLogin={googleLogin}
              onLoginRedirect={googleLoginRedirect}
              hasClientId={hasClientId}
              hasN8nUrl={!!n8nUrl}
            />
          )}

          {step === 'procedure' && user && (
            <ProcedureSelection
              userId={user.id}
              user={user}
              cart={cart}
              onAddToCart={handleAddToCart}
              onRemoveFromCart={handleRemoveFromCart}
              onCheckout={handleCheckout}
            />
          )}

          {step === 'payment' && orders.length > 0 && checkoutProcedures.length > 0 && (
            <Payment
              orders={orders}
              procedures={checkoutProcedures}
              onSuccess={handlePaymentSuccess}
              onCancel={() => {
                setCart([...checkoutProcedures])
                setOrders([])
                setCheckoutProcedures([])
                setStep('procedure')
              }}
            />
          )}

          {step === 'status' && orders.length > 0 && (
            <OrderStatus orders={orders} />
          )}
        </div>
      </main>
    </div>
  )
}
