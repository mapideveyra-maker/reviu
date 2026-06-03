"use client"
import { useState } from "react"
import { createClient } from "@supabase/supabase-js"

export default function ReportButton({ placeId, placeName }: { placeId: string; placeName: string }) {
  const [state, setState] = useState<"idle" | "saving" | "done">("idle")

  async function handleReport() {
    if (state !== "idle") return
    setState("saving")
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.from("listing_reports").insert({
      google_place_id: placeId,
      place_name: placeName,
      reported_at: new Date().toISOString(),
    })
    setState("done")
  }

  return (
    <div style={{ textAlign: "center", paddingTop: "16px" }}>
      <button
        onClick={handleReport}
        disabled={state !== "idle"}
        style={{
          background: "none",
          border: "none",
          color: state === "done" ? "#aaa" : "#bbb",
          fontSize: "11px",
          cursor: state === "idle" ? "pointer" : "default",
          textDecoration: state === "idle" ? "underline" : "none",
          padding: "4px",
        }}
      >
        {state === "idle" && "Report this listing"}
        {state === "saving" && "Reporting…"}
        {state === "done" && "Reported — thank you"}
      </button>
    </div>
  )
}
