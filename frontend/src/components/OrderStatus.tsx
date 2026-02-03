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
  completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
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
    <div className="max-w-app mx-auto space-y-4">
      {orders.map((order) => {
        const style = STATUS_STYLES[order.status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: order.status }
        return (
          <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex justify-between items-start gap-3 mb-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500">Order</p>
                <p className="font-semibold text-gray-900 truncate">{order.order_number}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                {style.label}
              </span>
            </div>
            {order.procedure_name && (
              <p className="text-sm text-gray-600 mb-3 truncate">{order.procedure_name}</p>
            )}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-500">Queue</p>
                <p className="text-lg font-bold text-blue-600">{order.queue_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Room</p>
                <p className="text-lg font-bold text-green-600">{order.room_number}</p>
              </div>
            </div>
            {order.status === 'in_progress' && (
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 mb-3">
                <p className="text-orange-800 text-sm font-medium">Go to room {order.room_number}</p>
                <p className="text-orange-700 text-xs mt-0.5">Queue: {order.queue_number}</p>
              </div>
            )}
            {order.status === 'completed' && (
              <div className="p-3 rounded-xl bg-green-50 border border-green-200 mb-3">
                <p className="text-green-800 text-sm font-medium">Completed</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                window.speechSynthesis.speak(new SpeechSynthesisUtterance(`Please proceed to ${order.room_number}. Queue number ${order.queue_number}.`))
              }}
              className="w-full h-11 rounded-xl bg-blue-600 text-white text-sm font-medium touch-target active:bg-blue-700"
            >
              Play audio guide
            </button>
          </div>
        )
      })}
    </div>
  )
}
