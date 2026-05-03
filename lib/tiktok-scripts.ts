import { formatCountryName } from "@/lib/country"
import type { ViralMoment } from "@/lib/viral-moments"

export type TikTokScriptPackage = {
  fr: {
    hook: string
    overlayLines: string[]
    voiceoverLines: string[]
    caption: string
    shotList: string[]
  }
  en: {
    hook: string
    overlayLines: string[]
    voiceoverLines: string[]
    caption: string
    shotList: string[]
  }
}

export function buildTikTokScript(moment: ViralMoment): TikTokScriptPackage {
  const country = formatCountryName(moment.country)
  const opponent = moment.opponent ? formatCountryName(moment.opponent) : null
  const gap = moment.gap ?? "?"

  if (moment.type === "BATTLE") {
    return {
      fr: {
        hook: `Il y a seulement ${gap}€ entre ces pays.`,
        overlayLines: [`${gap}€ d'écart`, "ça va changer", "regarde"],
        voiceoverLines: [
          `Il y a seulement ${gap}€ entre ${country}${opponent ? ` et ${opponent}` : ""}.`,
          "Un paiement peut tout changer.",
          "C’est en direct.",
        ],
        caption: "ça va bouger",
        shotList: ["leaderboard", "zoom sur les 2 pays", "écart", "map live"],
      },
      en: {
        hook: `There is only €${gap} between these countries.`,
        overlayLines: [`€${gap} gap`, "this will flip", "watch"],
        voiceoverLines: [
          `There is only €${gap} between ${country}${opponent ? ` and ${opponent}` : ""}.`,
          "One payment could flip this.",
          "This is happening live.",
        ],
        caption: "this is about to flip",
        shotList: ["leaderboard", "zoom on both countries", "gap", "live map"],
      },
    }
  }

  if (moment.type === "NEW_COUNTRY") {
    return {
      fr: {
        hook: `${country} vient d’apparaître.`,
        overlayLines: ["nouveau pays", "5€ seulement", "en direct"],
        voiceoverLines: [
          `${country} vient d’apparaître.`,
          "Quelqu’un a payé 5€.",
          "C’est tout.",
        ],
        caption: "nouveau pays en direct",
        shotList: ["map", "apparition du pays", "classement"],
      },
      en: {
        hook: `${country} just entered.`,
        overlayLines: ["new country", "€5 only", "live now"],
        voiceoverLines: [
          `${country} just entered.`,
          "Someone paid €5.",
          "That is all it takes.",
        ],
        caption: "new country just joined",
        shotList: ["map", "country entry", "ranking"],
      },
    }
  }

  return {
    fr: {
      hook: `${country} vient d’entrer dans le top 5.`,
      overlayLines: ["top 5", "ça bouge", "en direct"],
      voiceoverLines: [
        `${country} vient d’entrer dans le top 5.`,
        "Un paiement a suffi.",
        "C’est en direct.",
      ],
      caption: "top 5 en direct",
      shotList: ["leaderboard", "mouvement", "page success"],
    },
    en: {
      hook: `${country} entered the top 5.`,
      overlayLines: ["top 5", "just moved", "live ranking"],
      voiceoverLines: [
        `${country} entered the top 5.`,
        "One payment did that.",
        "This is live.",
      ],
      caption: "top 5 just changed",
      shotList: ["leaderboard", "movement", "success page"],
    },
  }
}