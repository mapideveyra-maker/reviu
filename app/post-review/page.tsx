'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function PostReview() {
  const [stars, setStars] = useState(0)
  const [hover, setHover] = useState(0)

  return (
    <main style={{
      fontFamily: 'sans-serif',
      maxWidth: '430px',
      margin: '0 auto',
      minHeight: '100vh',
      background: '#f7f7f5',
      paddingBottom: '80px',
    }}>
      <div style={{
        background: '#534AB7',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <Link href="/" style={{ color: 'white', fontSize: '20px', textDecoration: 'none' }}>←</Link>
        <span style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>Write a Review</span>
      </div>

      <div style={{ padding: '1rem' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', marginBottom: '12px', border: '1px solid #eee' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Search for a business</div>
          <input
            type="text"
            placeholder="Business name or address..."
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid #e5e5e5',
              fontSize: '14px',
              background: '#f7f7f5',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ marginTop: '12px' }}>
            {["Maria's Bakery & Cafe", 'Rosario Italian Kitchen', 'Blue Lotus Yoga'].map(biz => (
              <div key={biz} style={{
                padding: '12px',
                borderRadius: '10px',
                background: '#f7f7f5',
                marginBottom: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                border: '1px solid #eee',
              }}>{biz}</div>
            ))}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', marginBottom: '12px', border: '1px solid #eee' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Your rating</div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '8px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <span
                key={star}
                onClick={() => setStars(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                style={{
                  fontSize: '36px',
                  cursor: 'pointer',
                  color: star <= (hover || stars) ? '#f59e0b' : '#ddd',
                }}>★</span>
            ))}
          </div>
          <div style={{ textAlign: 'center', fontSize: '13px', color: '#888' }}>
            {stars === 0 && 'Tap to rate'}
            {stars === 1 && 'Poor'}
            {stars === 2 && 'Fair'}
            {stars === 3 && 'Good'}
            {stars === 4 && 'Very Good'}
            {stars === 5 && 'Excellent'}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', marginBottom: '12px', border: '1px solid #eee' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Your review</div>
          <textarea
            placeholder="Tell others about your experience. Be specific and honest — your review will be verified for legitimacy."
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid #e5e5e5',
              fontSize: '14px',
              background: '#f7f7f5',
              minHeight: '120px',
              resize: 'none',
              boxSizing: 'border-box',
              lineHeight: '1.5',
            }}
          />
        </div>

        <div style={{ background: '#EEEDFE', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#3C3489', lineHeight: '1.5' }}>
          🛡️ <strong>Reviu legitimacy check:</strong> Your review and profile will be analyzed to ensure authenticity. Reviews from verified accounts carry more weight.
        </div>

        <div style={{
          background: '#534AB7',
          color: 'white',
          padding: '16px',
          borderRadius: '14px',
          fontSize: '15px',
          fontWeight: '600',
          textAlign: 'center',
          cursor: 'pointer',
        }}>Submit Review</div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', background: 'white', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-around', padding: '12px 0 20px' }}>
        <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
          <span style={{ fontSize: '20px' }}>⊞</span>
          <span style={{ fontSize: '11px', color: '#888' }}>Home</span>
        </Link>
        <Link href="/post-review" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
          <span style={{ fontSize: '20px' }}>⊕</span>
          <span style={{ fontSize: '11px', color: '#534AB7', fontWeight: '600' }}>Review</span>
        </Link>
        <Link href="/influencers" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
          <span style={{ fontSize: '20px' }}>✦</span>
          <span style={{ fontSize: '11px', color: '#888' }}>Influencers</span>
        </Link>
        <Link href="/profile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
          <span style={{ fontSize: '20px' }}>◯</span>
          <span style={{ fontSize: '11px', color: '#888' }}>Profile</span>
        </Link>
      </div>
    </main>
  )
}