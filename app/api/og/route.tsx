import { ImageResponse } from "@vercel/og"
import { formatCountryName, getFlagEmoji } from "@/lib/country"

export const runtime = "edge"

function getSafeText(value: string | null, fallback: string) {
  if (!value) return fallback
  return value.trim().slice(0, 60) || fallback
}

function getScenarioData(params: URLSearchParams) {
  const rawCountry = getSafeText(params.get("country"), "A country")
  const rawOpponent = getSafeText(params.get("opponent"), "another country")

  const country = formatCountryName(rawCountry)
  const opponent = formatCountryName(rawOpponent)
  const countryFlag = getFlagEmoji(rawCountry)
  const opponentFlag = getFlagEmoji(rawOpponent)

  const type = params.get("type") || "MOVE"
  const rank = params.get("rank")
  const gap = params.get("gap")

  const badge =
    type === "NEW_COUNTRY"
      ? "NEW COUNTRY"
      : type === "TOP5"
        ? "TOP 5"
        : type === "BATTLE"
          ? "LIVE BATTLE"
          : "LIVE IMPACT"

  if (type === "NEW_COUNTRY") {
    return {
      type,
      badge,
      title: `${countryFlag} ${country} just entered`,
      subtitle: "A new country appeared on the board.",
      kicker: "€5. No reward. Public impact.",
      footerRight: rank ? `#${rank}` : "Live",
      accent: "#34d399",
      duel: null,
    }
  }

  if (type === "TOP5") {
    return {
      type,
      badge,
      title: `${countryFlag} ${country} entered the top 5`,
      subtitle: "One payment changed the ranking.",
      kicker: "€5. No reward. This is weird.",
      footerRight: rank ? `#${rank}` : "Top 5",
      accent: "#fbbf24",
      duel: null,
    }
  }

  if (type === "BATTLE") {
    return {
      type,
      badge,
      title: `${countryFlag} ${country} vs ${opponentFlag} ${opponent}`,
      subtitle: gap
        ? `Only €${gap} between them now.`
        : "This can flip at any moment.",
      kicker: "Live ranking. Visible tension.",
      footerRight: rank ? `#${rank}` : "Battle",
      accent: "#f87171",
      duel: {
        left: `${countryFlag} ${country}`,
        right: `${opponentFlag} ${opponent}`,
        gap: gap ? `€${gap}` : "Live",
      },
    }
  }

  return {
    type,
    badge,
    title: `${countryFlag} ${country} just moved`,
    subtitle: "The ranking changed in public, in real time.",
    kicker: "€5. No reward. Public impact.",
    footerRight: rank ? `#${rank}` : "Live",
    accent: "#34d399",
    duel: null,
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const scenario = getScenarioData(searchParams)

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#000000",
          color: "#ffffff",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 18%, rgba(255,255,255,0.08), transparent 28%), radial-gradient(circle at 50% 100%, rgba(255,255,255,0.05), transparent 40%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 60,
            left: "50%",
            transform: "translateX(-50%)",
            width: 700,
            height: 700,
            borderRadius: 9999,
            background:
              scenario.type === "TOP5"
                ? "rgba(251,191,36,0.16)"
                : scenario.type === "BATTLE"
                  ? "rgba(248,113,113,0.16)"
                  : "rgba(52,211,153,0.16)",
            filter: "blur(130px)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "42px 48px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "12px 18px",
                borderRadius: 9999,
                border: `1px solid ${scenario.accent}55`,
                background:
                  scenario.type === "TOP5"
                    ? "rgba(251,191,36,0.12)"
                    : scenario.type === "BATTLE"
                      ? "rgba(248,113,113,0.12)"
                      : "rgba(52,211,153,0.12)",
                color:
                  scenario.type === "TOP5"
                    ? "#fde68a"
                    : scenario.type === "BATTLE"
                      ? "#fecaca"
                      : "#a7f3d0",
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: "0.22em",
              }}
            >
              {scenario.badge}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "rgba(255,255,255,0.72)",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 9999,
                  background: scenario.accent,
                }}
              />
              LIVE
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
          >
            {scenario.duel ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid rgba(255,255,255,0.10)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03))",
                  borderRadius: 34,
                  padding: "34px 34px 30px",
                  boxShadow: "0 20px 80px rgba(0,0,0,0.35)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 20,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      fontSize: 44,
                      fontWeight: 800,
                      lineHeight: 1.05,
                      maxWidth: 380,
                    }}
                  >
                    {scenario.duel.left}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 26,
                        color: "rgba(255,255,255,0.42)",
                        fontWeight: 800,
                        letterSpacing: "0.18em",
                      }}
                    >
                      VS
                    </div>
                    <div
                      style={{
                        padding: "10px 16px",
                        borderRadius: 9999,
                        background: "rgba(248,113,113,0.14)",
                        border: "1px solid rgba(248,113,113,0.24)",
                        color: "#fecaca",
                        fontSize: 28,
                        fontWeight: 800,
                      }}
                    >
                      {scenario.duel.gap}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      fontSize: 44,
                      fontWeight: 800,
                      lineHeight: 1.05,
                      maxWidth: 380,
                      textAlign: "right",
                    }}
                  >
                    {scenario.duel.right}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 28,
                    fontSize: 34,
                    lineHeight: 1.2,
                    color: "rgba(255,255,255,0.78)",
                    fontWeight: 700,
                  }}
                >
                  {scenario.subtitle}
                </div>

                <div
                  style={{
                    display: "flex",
                    marginTop: 20,
                    fontSize: 22,
                    color: "rgba(255,255,255,0.48)",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontWeight: 800,
                  }}
                >
                  {scenario.kicker}
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid rgba(255,255,255,0.10)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03))",
                  borderRadius: 34,
                  padding: "38px 38px 34px",
                  boxShadow: "0 20px 80px rgba(0,0,0,0.35)",
                }}
              >
                <div
                  style={{
                    fontSize: scenario.type === "TOP5" ? 72 : 78,
                    fontWeight: 900,
                    lineHeight: 1.02,
                    letterSpacing: "-0.04em",
                    maxWidth: 980,
                  }}
                >
                  {scenario.title}
                </div>

                <div
                  style={{
                    marginTop: 20,
                    fontSize: 34,
                    lineHeight: 1.25,
                    color: "rgba(255,255,255,0.72)",
                    maxWidth: 860,
                  }}
                >
                  {scenario.subtitle}
                </div>

                <div
                  style={{
                    display: "flex",
                    marginTop: 28,
                    fontSize: 22,
                    color: "rgba(255,255,255,0.48)",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontWeight: 800,
                  }}
                >
                  {scenario.kicker}
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  color: "rgba(255,255,255,0.42)",
                }}
              >
                GiveFive
              </div>

              <div
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.88)",
                }}
              >
                Public impact, live ranking
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 8,
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  color: "rgba(255,255,255,0.42)",
                }}
              >
                Status
              </div>

              <div
                style={{
                  fontSize: 42,
                  fontWeight: 900,
                  color: "#ffffff",
                  letterSpacing: "-0.03em",
                }}
              >
                {scenario.footerRight}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}