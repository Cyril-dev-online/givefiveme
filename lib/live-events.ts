type DonationEvent = {
  type: "donation"
  payload: {
    id: string
    amount: number
    country: string | null
    latitude: number | null
    longitude: number | null
    createdAt: string
    isFirstCountry?: boolean
    countryCount?: number
    totalAmount?: number
    totalDonations?: number
  }
}

type MilestoneEvent = {
  type: "milestone"
  payload: {
    amount: number
    totalAmount: number
  }
}

export type LiveEvent = DonationEvent | MilestoneEvent

type Listener = (event: LiveEvent) => void

const listeners = new Set<Listener>()

export function subscribe(listener: Listener) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

function broadcast(event: LiveEvent) {
  for (const listener of listeners) {
    listener(event)
  }
}

export function emitNewDonation(payload: DonationEvent["payload"]) {
  broadcast({
    type: "donation",
    payload,
  })
}

export function emitMilestone(payload: MilestoneEvent["payload"]) {
  broadcast({
    type: "milestone",
    payload,
  })
}