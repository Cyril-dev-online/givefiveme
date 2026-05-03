"use client"

import { toast } from "sonner"
import { useLiveExperiment } from "@/hooks/useLiveExperiment"

type Props = {
  onDonation?: (payload: {
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
  }) => void
  onMilestone?: (payload: { amount: number; totalAmount: number }) => void
}

export function LiveToasts({ onDonation, onMilestone }: Props) {
  useLiveExperiment({
    onDonation: (payload) => {
      if (payload.firstCountry) {
        toast(`🌍 ${payload.country} joined the experiment`, {
          description: `${payload.countryCount ?? ""} countries participating`,
        })
      } else {
        toast(`🌍 ${payload.country} joined`, {
          description: `+€${payload.amount}`,
        })
      }

      onDonation?.(payload)
    },

    onMilestone: (payload) => {
      toast(`🎉 Milestone reached`, {
        description: `The experiment just passed €${payload.amount.toLocaleString()}`,
      })

      onMilestone?.(payload)
    },
  })

  return null
}