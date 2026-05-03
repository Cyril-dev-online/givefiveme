import "./globals.css"
import VisitTracker from "@/components/VisitTracker"
import "mapbox-gl/dist/mapbox-gl.css"

export const metadata = {
  title: "GiveMeFive",
  description: "A global internet experiment",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <VisitTracker />
        {children}
      </body>
    </html>
  )
}