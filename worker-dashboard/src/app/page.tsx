'use client'

import { useState, useEffect } from 'react'
import OrderList from '@/components/OrderList'

export default function WorkerDashboard() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏥 Hospital Worker Dashboard
          </h1>
          <p className="text-gray-600">
            Manage patient orders and update test status
          </p>
        </div>

        <OrderList />
      </div>
    </main>
  )
}
