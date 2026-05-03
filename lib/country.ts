export function formatCountryName(value: string | null | undefined) {
  if (!value) return "Unknown"

  const name = value.trim().toLowerCase()

  // Capitalisation simple
  const formatted =
    name.charAt(0).toUpperCase() + name.slice(1)

  // Cas spéciaux
  if (formatted === "Usa") return "USA"

  return formatted
}

export function getFlagEmoji(countryName: string | null | undefined) {
  if (!countryName) return "🌍"

  const map: Record<string, string> = {
    france: "🇫🇷",
    morocco: "🇲🇦",
    usa: "🇺🇸",
    germany: "🇩🇪",
    spain: "🇪🇸",
    italy: "🇮🇹",
    uk: "🇬🇧",
    united_kingdom: "🇬🇧",
  }

  return map[countryName.toLowerCase()] || "🌍"
}

export function formatCountryDisplay(value: string | null | undefined) {
  const name = formatCountryName(value)
  const flag = getFlagEmoji(value?.toLowerCase())

  return `${flag} ${name}`
}