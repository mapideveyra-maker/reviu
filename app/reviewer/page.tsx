import Link from 'next/link'

export default function ReviewerProfile() {
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
        <Link href="/business" style={{
          color: 'white',
          fontSize: '20px',
          textDecoration: 'none',
        }}>←</Link>
        <span style={{
          fontSize: '16px',
          fontWeight: '600',
          color: 'white',
        }}>Reviewer Profile</span>
      </div>

      <div style={{
        background: 'white',
        padding: '1.25rem',
        marginBottom: '8px',
      }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start',
          marginBottom: '16px',
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#FCEBEB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: '700',
            color: '#A32D2D',
            flexShrink: 0,
          }}>TC</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '2px' }}>TechCritic99</div>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>Member 8 months · Cincinnati, OH · 38 reviews</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                { text: 'Serial 1-star', color: '#A32D2D', bg: '#FCEBEB' },
                { text: 'No verified purchases', color: '#854F0B', bg: '#FAEEDA' },
                { text: 'Extreme negativity', color: '#A32D2D', bg: '#FCEBEB' },
              ].map(badge => (
                <span key={badge.text} style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: badge.bg,
                  color: badge.color,
                }}>{badge.text}</span>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#FCEBEB',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px',
            }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#A32D2D', lineHeight: '1' }}>8</div>
              <div style={{ fontSize: '9px', color: '#A32D2D' }}>/100</div>
            </div>
            <div style={{ fontSize: '10px', color: '#A32D2D', fontWeight: '600' }}>Very low</div>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', padding: '1.25rem', marginBottom: '8px' }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '600',
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '12px',
        }}>Review pattern</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          {[
            { label: 'Total reviews', value: '38', color: '#A32D2D' },
            { label: 'Avg rating', value: '1.1★', color: '#A32D2D' },
            { label: '5-star given', value: '0', color: '#A32D2D' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#f7f7f5', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {[
          { label: 'Rating balance', pct: 5, color: '#E24B4A' },
          { label: 'Review authenticity', pct: 12, color: '#E24B4A' },
          { label: 'Geographic consistency', pct: 40, color: '#EF9F27' },
          { label: 'Account legitimacy', pct: 8, color: '#E24B4A' },
        ].map(item => (
          <div key={item.label} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
              <span>{item.label}</span>
              <span style={{ fontWeight: '600', color: item.color }}>{item.pct}%</span>
            </div>
            <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${item.pct}%`, height: '100%', background: item.color, borderRadius: '3px' }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', padding: '1.25rem', marginBottom: '8px' }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '600',
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '12px',
        }}>Online presence</div>

        {[
          { platform: 'Google Reviews', detail: '38 reviews · all 1-star', status: 'High risk', color: '#A32D2D', bg: '#FCEBEB' },
          { platform: 'Yelp', detail: 'Same username · 12 reviews · all 1-star', status: 'High risk', color: '#A32D2D', bg: '#FCEBEB' },
          { platform: 'LinkedIn', detail: 'Partial profile · 3 connections', status: 'Weak', color: '#854F0B', bg: '#FAEEDA' },
          { platform: 'Glassdoor', detail: '2 employer reviews · both negative', status: 'Negative', color: '#854F0B', bg: '#FAEEDA' },
          { platform: 'Facebook', detail: 'No public profile found', status: 'Not found', color: '#888', bg: '#f0f0f0' },
        ].map(item => (
          <div key={item.platform} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#EEEDFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: '700',
              color: '#534AB7',
              flexShrink: 0,
            }}>{item.platform.slice(0, 2)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '2px' }}>{item.platform}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>{item.detail}</div>
            </div>
            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              padding: '3px 8px',
              borderRadius: '6px',
              background: item.bg,
              color: item.color,
              whiteSpace: 'nowrap',
            }}>{item.status}</span>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', padding: '1.25rem', marginBottom: '8px' }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '600',
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '12px',
        }}>Recent reviews left</div>

        {[
          { biz: "Maria's Bakery", stars: 1, text: 'Health code violations everywhere. Do not eat here.', time: '5 days ago' },
          { biz: 'Grind House Coffee', stars: 1, text: 'Absolutely terrible. Rude staff, disgusting drinks.', time: '3 weeks ago' },
          { biz: "Dot's Flower Shop", stars: 1, text: 'Never again. Worst customer service I have ever seen.', time: '1 month ago' },
        ].map(review => (
          <div key={review.biz} style={{ paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid #f5f5f5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{review.biz}</span>
              <span style={{ fontSize: '12px', color: '#888' }}>{review.time}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#f59e0b', marginBottom: '4px' }}>
              {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
            </div>
            <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.5' }}>{review.text}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ background: '#534AB7', color: 'white', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', textAlign: 'center', cursor: 'pointer' }}>Dispute this review</div>
        <div style={{ background: 'white', color: '#534AB7', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', textAlign: 'center', cursor: 'pointer', border: '1px solid #534AB7' }}>Send private message</div>
        <div style={{ background: 'white', color: '#A32D2D', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', textAlign: 'center', cursor: 'pointer', border: '1px solid #F09595' }}>Report to Google / Yelp</div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', background: 'white', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-around', padding: '12px 0 20px' }}>
        <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
          <span style={{ fontSize: '20px' }}>⊞</span>
          <span style={{ fontSize: '11px', color: '#888' }}>Home</span>
        </Link>
        <Link href="/post-review" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
          <span style={{ fontSize: '20px' }}>⊕</span>
          <span style={{ fontSize: '11px', color: '#888' }}>Review</span>
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