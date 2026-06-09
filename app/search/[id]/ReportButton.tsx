"use client"
import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
export default function ReportButton({ placeId, placeName }: { placeId: string; placeName: string }) {
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle")
  async function handleReport() {
    if (state !== "idle") return
    setState("saving")
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error } = await supabase.from("listing_reports").insert({
      google_place_id: placeId,
      place_name: placeName,
      created_at: new Date().toISOString(),
    })
    if (error) {
      console.error("Report failed:", error.message)
      setState("error")
      return
    }
    setState("done")
  }
  return (
    <div style={{ textAlign: "center", paddingTop: "16px" }}>
      <button
        onClick={handleReport}
        disabled={state === "saving" || state === "done"}
        style={{
          background: "none",
          border: "none",
          color: state === "done" ? "#aaa" : state === "error" ? "#c0392b" : "#bbb",
          fontSize: "11px",
          cursor: state === "idle" || state === "error" ? "pointer" : "default",
          textDecoration: state === "idle" ? "underline" : "none",
          padding: "4px",
        }}
      >
        {state === "idle" && "Report this listing"}
        {state === "saving" && "Reporting…"}
        {state === "done" && "Reported — thank you"}
        {state === "error" && "Couldn't report — tap to try again"}
      </button>
    </div>
  )
}