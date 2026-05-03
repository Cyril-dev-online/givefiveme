"use client"

import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts"

export default function RevenueChart() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetch("/api/admin/revenue-by-month")
      .then(res => res.json())
      .then(data => setData(data))
  }, [])

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl">
      <h2 className="text-white text-xl mb-4">Revenue par mois</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="month" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#6366f1"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}