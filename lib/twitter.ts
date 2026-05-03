import crypto from "crypto"

const X_API_KEY = process.env.X_API_KEY
const X_API_SECRET = process.env.X_API_SECRET
const X_ACCESS_TOKEN = process.env.X_ACCESS_TOKEN
const X_ACCESS_TOKEN_SECRET = process.env.X_ACCESS_TOKEN_SECRET

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

function percentEncode(value: string) {
  return encodeURIComponent(value)
    .replace(/[!'()*]/g, (char) =>
      `%${char.charCodeAt(0).toString(16).toUpperCase()}`
    )
}

function buildOAuthHeader(method: string, url: string) {
  const apiKey = requireEnv("X_API_KEY", X_API_KEY)
  const apiSecret = requireEnv("X_API_SECRET", X_API_SECRET)
  const accessToken = requireEnv("X_ACCESS_TOKEN", X_ACCESS_TOKEN)
  const accessTokenSecret = requireEnv(
    "X_ACCESS_TOKEN_SECRET",
    X_ACCESS_TOKEN_SECRET
  )

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: apiKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
  }

  // For application/json requests, do NOT include JSON body fields
  // in the OAuth 1.0a signature base string.
  const paramString = Object.keys(oauthParams)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(oauthParams[key])}`)
    .join("&")

  const baseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(paramString),
  ].join("&")

  const signingKey = `${percentEncode(apiSecret)}&${percentEncode(
    accessTokenSecret
  )}`

  const signature = crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64")

  const signedParams = {
    ...oauthParams,
    oauth_signature: signature,
  }

  return (
    "OAuth " +
    Object.keys(signedParams)
      .sort()
      .map(
        (key) => `${percentEncode(key)}="${percentEncode(signedParams[key])}"`
      )
      .join(", ")
  )
}

export async function postTweet(text: string) {
  if (!text.trim()) {
    throw new Error("Tweet text is empty")
  }

  const url = "https://api.x.com/2/tweets"
  const authHeader = buildOAuthHeader("POST", url)

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`X API error ${res.status}: ${errorText}`)
  }

  return res.json()
}