import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Reviu",
  description: "The fairest review platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, minHeight: "100vh", background: "#f7f7f5" }}>
        <div style={{ maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5" }}>
          {children}
        </div>
      </body>
    </html>
  )
}