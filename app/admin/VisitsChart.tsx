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

export default function VisitsChart() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetch("/api/admin/visits-by-day")
      .then(res => res.json())
      .then(data => setData(data))
  }, [])

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl">
      <h2 className="text-white text-xl mb-4">
        Visites par jour
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="day" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#22c55e"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}