"use client"
import Link from "next/link"
import { useState } from "react"
export default function ClaimBusiness() {
  const [step, setStep] = useState(1)
  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: "#f7f7f5", paddingBottom: "80px" }}>
      <div style={{ background: "#534AB7", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "12px" }}>
        <Link href="/business" style={{ color: "white", fontSize: "20px", textDecoration: "none" }}>←</Link>
        <span style={{ fontSize: "16px", fontWeight: "600", color: "white" }}>Claim Your Business</span>
      </div>
      <div style={{ padding: "1rem" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem" }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: "4px", borderRadius: "2px", background: s <= step ? "#534AB7" : "#e5e5e5" }} />
          ))}
        </div>
        {step === 1 && (
          <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "12px", border: "1px solid #eee" }}>
            <div style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>{"Is this your business?"}</div>
            <div style={{ fontSize: "14px", color: "#555", marginBottom: "20px", lineHeight: "1.6" }}>{"We found this listing for Maria's Bakery & Cafe at 123 Erie Ave, Hyde Park. Claim it to manage your reviews and protect your reputation."}</div>
            <div style={{ background: "#f7f7f5", borderRadius: "12px", padding: "1rem", marginBottom: "20px", border: "1px solid #eee" }}>
              <div style={{ fontWeight: "600", fontSize: "15px", marginBottom: "4px" }}>{"Maria's Bakery & Cafe"}</div>
              <div style={{ fontSize: "13px", color: "#888" }}>123 Erie Ave, Hyde Park, Cincinnati OH</div>
              <div style={{ fontSize: "13px", color: "#888" }}>Bakery · (513) 555-0142</div>
            </div>
            <div onClick={() => setStep(2)} style={{ background: "#534AB7", color: "white", padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", textAlign: "center", cursor: "pointer" }}>Yes, this is my business</div>
            <div style={{ textAlign: "center", marginTop: "12px", fontSize: "13px", color: "#888", cursor: "pointer" }}>Not my business — search again</div>
          </div>
        )}
        {step === 2 && (
          <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "12px", border: "1px solid #eee" }}>
            <div style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Verify ownership</div>
            <div style={{ fontSize: "14px", color: "#555", marginBottom: "20px", lineHeight: "1.6" }}>Choose how you want to verify you own this business.</div>
            {[
              { icon: "📞", title: "Phone verification", sub: "We call (513) 555-0142 with a code" },
              { icon: "📧", title: "Email verification", sub: "Send code to owner@mariasbakery.com" },
              { icon: "📋", title: "Document upload", sub: "Upload business license or registration" },
            ].map(opt => (
              <div key={opt.title} onClick={() => setStep(3)} style={{ display: "flex", gap: "12px", alignItems: "center", padding: "14px", borderRadius: "12px", border: "1px solid #eee", marginBottom: "10px", cursor: "pointer", background: "#f7f7f5" }}>
                <span style={{ fontSize: "24px" }}>{opt.icon}</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "600" }}>{opt.title}</div>
                  <div style={{ fontSize: "12px", color: "#888" }}>{opt.sub}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {step === 3 && (
          <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "12px", border: "1px solid #eee" }}>
            <div style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Enter verification code</div>
            <div style={{ fontSize: "14px", color: "#555", marginBottom: "20px", lineHeight: "1.6" }}>We sent a 6-digit code to (513) 555-0142. Enter it below.</div>
            <input type="text" placeholder="Enter 6-digit code" style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "1px solid #e5e5e5", fontSize: "20px", textAlign: "center", letterSpacing: "8px", boxSizing: "border-box", marginBottom: "16px" }} />
            <Link href="/business-dashboard" style={{ display: "block", background: "#534AB7", color: "white", padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", textAlign: "center", cursor: "pointer", textDecoration: "none" }}>Verify and claim business</Link>
            <div style={{ textAlign: "center", marginTop: "12px", fontSize: "13px", color: "#534AB7", cursor: "pointer" }}>Resend code</div>
          </div>
        )}
      </div>
    </main>
  )
}
