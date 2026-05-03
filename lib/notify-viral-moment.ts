import { formatCountryName } from "@/lib/country"
import type { ViralMoment } from "@/lib/viral-moments"
import type { TikTokScriptPackage } from "@/lib/tiktok-scripts"

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
}

function block(title: string, lines: string[]) {
  return [
    title,
    ...lines.map((line) => `- ${line}`),
  ].join("\n")
}

export async function notifyViralMoment(
  moment: ViralMoment,
  script: TikTokScriptPackage
) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    console.warn("[viral] telegram not configured")
    return
  }

  const country = formatCountryName(moment.country)
  const opponent = moment.opponent ? formatCountryName(moment.opponent) : null
  const shareUrl = `${getBaseUrl()}/share/${moment.orderId}`

  const message = [
    `🔥 VIRAL MOMENT — SCORE ${moment.score}`,
    `Type: ${moment.type}`,
    `Country/Pays: ${country}`,
    opponent ? `Opponent/Adversaire: ${opponent}` : null,
    moment.gap != null ? `Gap/Écart: €${moment.gap}` : null,
    moment.rank ? `Rank/Rang: #${moment.rank}` : null,
    `Reason: ${moment.reason}`,
    "",
    `🇫🇷 FR`,
    `Hook: ${script.fr.hook}`,
    "",
    block("Overlay:", script.fr.overlayLines),
    "",
    block("Voix:", script.fr.voiceoverLines),
    "",
    `Caption: ${script.fr.caption}`,
    "",
    block("Shots:", script.fr.shotList),
    "",
    `🇬🇧 EN`,
    `Hook: ${script.en.hook}`,
    "",
    block("Overlay:", script.en.overlayLines),
    "",
    block("Voice-over:", script.en.voiceoverLines),
    "",
    `Caption: ${script.en.caption}`,
    "",
    block("Shots:", script.en.shotList),
    "",
    `🔗 Link:`,
    shareUrl,
  ]
    .filter(Boolean)
    .join("\n")

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      disable_web_page_preview: true,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`[viral] telegram failed: ${text}`)
  }
}