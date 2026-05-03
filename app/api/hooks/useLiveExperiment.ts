"use client"

import { useEffect } from "react"

type DonationPayload = {
  id: string
  amount: number
  country: string
  latitude: number | null
  longitude: number | null
  createdAt: string
  firstCountry?: boolean
  countryCount?: number
  totalAmount?: number
  totalDonations?: number
}

type MilestonePayload = {
  amount: number
  totalAmount: number
}

type Options = {
  onDonation?: (payload: DonationPayload) => void
  onMilestone?: (payload: MilestonePayload) => void
}

export function useLiveExperiment(options: Options) {
  useEffect(() => {
    const source = new EventSource("/api/live")

    source.addEventListener("donation", (event) => {
      const payload = JSON.parse((event as MessageEvent).data)
      options.onDonation?.(payload)
    })

    source.addEventListener("milestone", (event) => {
      const payload = JSON.parse((event as MessageEvent).data)
      options.onMilestone?.(payload)
    })

    return () => {
      source.close()
    }
  }, [options])
}