type ImpactType = "NEW_COUNTRY" | "TOP5" | "BATTLE" | "MOVE"

export type ViralMomentType = "BATTLE" | "NEW_COUNTRY" | "TOP5_ENTRY"

export type ViralMoment = {
  type: ViralMomentType
  score: number
  country: string
  opponent?: string | null
  gap?: number | null
  rank?: number | null
  reason: string
  orderId: string
  dedupeKey: string
  payload: Record<string, unknown>
}

export function detectViralMoment(args: {
  orderId: string
  country: string
  countryRank: number | null
  impactType: ImpactType
  impactData: Record<string, unknown> | null | undefined
}): ViralMoment | null {
  const { orderId, country, countryRank, impactType, impactData } = args

  if (impactType === "BATTLE") {
    const gapValue = Number(impactData?.gap)
    const opponent =
      typeof impactData?.opponent === "string" ? impactData.opponent : null

    if (!Number.isFinite(gapValue)) return null

    const topBonus = countryRank && countryRank <= 5 ? 25 : 0
    const gapBonus = gapValue <= 1 ? 45 : gapValue <= 2 ? 30 : 0
    const score = gapBonus + topBonus

    if (score < 40) return null

    return {
      type: "BATTLE",
      score,
      country,
      opponent,
      gap: gapValue,
      rank: countryRank,
      reason: `Gap ${gapValue} with ${opponent ?? "opponent"}`,
      orderId,
      dedupeKey: `battle:${country}:${opponent ?? "none"}:${gapValue <= 1 ? "hot" : "warm"}`,
      payload: {
        impactType,
        impactData,
      },
    }
  }

  if (impactType === "NEW_COUNTRY") {
    return {
      type: "NEW_COUNTRY",
      score: 70,
      country,
      opponent: null,
      gap: null,
      rank: countryRank,
      reason: "First entry for this country",
      orderId,
      dedupeKey: `new_country:${country}`,
      payload: {
        impactType,
        impactData,
      },
    }
  }

  if (impactType === "TOP5" && countryRank && countryRank <= 5) {
    return {
      type: "TOP5_ENTRY",
      score: 65,
      country,
      opponent: null,
      gap: null,
      rank: countryRank,
      reason: "Country entered top 5",
      orderId,
      dedupeKey: `top5:${country}:${countryRank}`,
      payload: {
        impactType,
        impactData,
      },
    }
  }

  return null
}