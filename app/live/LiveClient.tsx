"use client"

import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export default function LiveClient({ stats }: any) {

  const [feed, setFeed] = useState(stats.latest)
  const [popup, setPopup] = useState<any>(null)

  useEffect(() => {

    const socket = io()

    socket.on("new-donation", (donation) => {

      setFeed((prev:any) => [donation, ...prev].slice(0,10))

      setPopup(donation)

      setTimeout(() => setPopup(null), 4000)

    })

  }, [])

  return (
    <div style={{ padding: 40 }}>

      <h1 style={{ fontSize: 42, fontWeight: "bold" }}>
        🌍 Global Live Donations
      </h1>

      <p style={{ marginBottom: 40 }}>
        Total donations: {stats.total}
      </p>

      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={stats.chartData}>
            <XAxis dataKey="country" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2 style={{ marginTop: 40 }}>🔴 Live Feed</h2>

      {feed.map((o:any, i:number) => (
        <div key={i}>
          🌍 {o.country} — ${o.amount}
        </div>
      ))}

      {popup && (
        <div style={{
          position:"fixed",
          bottom:30,
          right:30,
          background:"#000",
          color:"#fff",
          padding:"14px 20px",
          borderRadius:10,
          fontWeight:"bold"
        }}>
          🔴 Someone from {popup.country} donated ${popup.amount}
        </div>
      )}

    </div>
  )
}