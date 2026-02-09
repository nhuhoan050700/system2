'use client'

import { useState, useEffect, useRef } from 'react'

interface Order {
  id: number
  order_number: string
  queue_number: string
  room_number: string
  status: string
  total_amount: number
  procedure_name?: string
}

interface OrderStatusProps {
  orders: Order[]
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pending' },
  paid: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Paid' },
  assigned: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Assigned' },
  in_progress: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'In progress' },
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Done' },
}

export default function OrderStatus({ orders: initialOrders }: OrderStatusProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const ref = useRef(orders)
  ref.current = orders

  useEffect(() => {
    const interval = setInterval(async () => {
      const n8nUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || ''
      const current = ref.current
      const updates: Order[] = []
      let changed = false
      for (const o of current) {
        try {
          const response = await fetch(`${n8nUrl}/order-status?order_id=${o.id}`)
          const data = await response.json()
          if (data.success && data.order) {
            updates.push(data.order)
            if (data.order.status !== o.status) {
              changed = true
              if (data.order.status === 'in_progress') {
                window.speechSynthesis.speak(new SpeechSynthesisUtterance(`Please proceed to ${data.order.room_number}. Queue number ${data.order.queue_number}.`))
              } else if (data.order.status === 'completed') {
                window.speechSynthesis.speak(new SpeechSynthesisUtterance('Your test has been completed. Thank you!'))
              }
            }
          } else {
            updates.push(o)
          }
        } catch {
          updates.push(o)
        }
      }
      if (changed) setOrders(updates)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-app mx-auto space-y-5">
      <p className="text-[13px] text-[var(--app-text-secondary)] font-medium px-0.5">Your orders</p>
      {orders.map((order) => {
        const style = STATUS_STYLES[order.status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: order.status }
        const isActive = order.status === 'in_progress'
        const isDone = order.status === 'completed'
        return (
          <div
            key={order.id}
            className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-200 ${
              isActive ? 'border-orange-200 ring-1 ring-orange-100' : 'border-gray-100'
            } ${isDone ? 'opacity-95' : ''}`}
          >
            <div className="p-5">
              <div className="flex justify-between items-start gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-wider text-[var(--app-text-secondary)] font-semibold">Order</p>
                  <p className="font-semibold text-gray-900 text-[15px] truncate mt-0.5">{order.order_number}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${style.bg} ${style.text}`}>
                  {style.label}
                </span>
              </div>
              {order.procedure_name && (
                <p className="text-[13px] text-[var(--app-text-secondary)] mb-4 truncate">{order.procedure_name}</p>
              )}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl bg-gray-50 px-3 py-2.5">
                  <p className="text-[11px] text-[var(--app-text-secondary)] font-medium">Queue</p>
                  <p className="text-base font-bold text-[var(--app-primary)] tabular-nums mt-0.5">{order.queue_number}</p>
                </div>
                <div className="rounded-xl bg-gray-50 px-3 py-2.5">
                  <p className="text-[11px] text-[var(--app-text-secondary)] font-medium">Room</p>
                  <p className="text-base font-bold text-emerald-600 tabular-nums mt-0.5">{order.room_number}</p>
                </div>
              </div>
              {isActive && (
                <div className="rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 mb-4">
                  <p className="text-orange-800 text-sm font-semibold">Go to {order.room_number}</p>
                  <p className="text-orange-600/90 text-xs mt-0.5">Queue {order.queue_number}</p>
                </div>
              )}
              {isDone && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 mb-4 flex items-center gap-2">
                  <span className="text-emerald-600 text-lg">✓</span>
                  <p className="text-emerald-800 text-sm font-semibold">Completed</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  window.speechSynthesis.speak(new SpeechSynthesisUtterance(`Please proceed to ${order.room_number}. Queue number ${order.queue_number}.`))
                }}
                className="w-full h-11 rounded-xl bg-gray-100 text-gray-800 text-sm font-semibold touch-target hover:bg-gray-200 active:scale-[0.98] transition-all duration-150"
              >
                Play audio guide
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
