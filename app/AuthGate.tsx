"use client"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const PUBLIC_ROUTES = ["/login", "/signup"]

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false)
  const [authed, setAuthed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setAuthed(true)
      } else if (!PUBLIC_ROUTES.includes(pathname)) {
        router.push("/signup")
      }
      setChecked(true)
    })
  }, [pathname])

  if (!checked) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#534AB7", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "48px", fontWeight: "700", color: "white", marginBottom: "8px" }}>✦</div>
        <div style={{ fontSize: "18px", fontWeight: "700", color: "white" }}>Reviu</div>
      </div>
    </div>
  )

  if (!authed && !PUBLIC_ROUTES.includes(pathname)) return null

  return <>{children}</>
}