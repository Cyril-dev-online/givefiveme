import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { password } = await request.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Mot de passe incorrect" },
      { status: 401 }
    )
  }

  const response = NextResponse.json({ success: true })

  response.cookies.set("admin", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 4, // 4h
  })

  return response
}