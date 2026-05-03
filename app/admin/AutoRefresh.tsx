"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AutoRefresh() {
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh() // refresh les Server Components
    }, 5000) // toutes les 5 secondes

    return () => clearInterval(interval)
  }, [router])

  return null
}