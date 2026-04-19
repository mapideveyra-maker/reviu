import Link from 'next/link'

export default function Home() {
  const businesses = [
    { id: 1, name: "Maria's Bakery & Cafe", cat: 'Bakery', location: 'Hyde Park', stars: 4.6, reviews: 182, score: 94, flag: 1 },
    { id: 2, name: 'Rosario Italian Kitchen', cat: 'Restaurant', location: 'Hyde Park', stars: 4.4, reviews: 210, score: 87, flag: 2 },
    { id: 3, name: 'Blue Lotus Yoga', cat: 'Health', location: 'Oakley', stars: 4.9, reviews: 74, score: 98, flag: 0 },
    { id: 4, name: 'Kingpin Barber Co.', cat: 'Services', location: 'Norwood', stars: 3.8, reviews: 310, score: 61, flag: 6 },
    { id: 5, name: "Dot's Flower Shop", cat: 'Retail', location: 'Montgomery', stars: 4.7, reviews: 58, score: 89, flag: 2 },
    { id: 6, name: 'Premier Auto Detailing', cat: 'Services', location: 'Blue Ash', stars: 4.5, reviews: 127, score: 91, flag: 3 },
  ]

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
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: '22px',
          fontWeight: '700',
          color: 'white',
          letterSpacing: '-0.5px',
        }}>Reviu</span>
        <span style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.8)',
        }}>Cincinnati, OH</span>
      </div>

      <div style={{ padding: '1rem' }}>
        <input
          type="text"
          placeholder="Search businesses, reviewers..."
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid #e5e5e5',
            fontSize: '14px',
            background: 'white',
            marginBottom: '1rem',
            boxSizing: 'border-box',
          }}
        />

        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          marginBottom: '1.25rem',
          paddingBottom: '4px',
        }}>
          {['All','Restaurants','Retail','Services','Health','Beauty'].map(cat => (
            <div key={cat} style={{
              padding: '6px 14px',
              borderRadius: '20px',
              background: cat === 'All' ? '#534AB7' : 'white',
              color: cat === 'All' ? 'white' : '#666',
              fontSize: '13px',
              whiteSpace: 'nowrap',
              border: '1px solid #e5e5e5',
              cursor: 'pointer',
            }}>{cat}</div>
          ))}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#888',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>Featured businesses</div>
          <div style={{
            fontSize: '12px',
            color: '#534AB7',
            fontWeight: '600',
            cursor: 'pointer',
          }}>See all</div>
        </div>

        {businesses.map(biz => (
          <Link href="/business" key={biz.id} style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1rem 1.25rem',
            marginBottom: '12px',
            border: '1px solid #eee',
            display: 'block',
            textDecoration: 'none',
            color: 'inherit',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px',
            }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '2px' }}>{biz.name}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{biz.cat} · {biz.location}, OH</div>
              </div>
              <div style={{
                background: biz.score >= 90 ? '#EAF3DE' : biz.score >= 75 ? '#FAEEDA' : '#FCEBEB',
                color: biz.score >= 90 ? '#3B6D11' : biz.score >= 75 ? '#854F0B' : '#A32D2D',
                fontSize: '11px',
                fontWeight: '700',
                padding: '4px 8px',
                borderRadius: '8px',
              }}>{biz.score}% legit</div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '13px',
              color: '#555',
            }}>
              <span style={{ color: '#f59e0b' }}>{'★'.repeat(Math.round(biz.stars))}</span>
              <span>{biz.stars} · {biz.reviews} reviews</span>
              {biz.flag > 0 && (
                <span style={{
                  background: '#FCEBEB',
                  color: '#A32D2D',
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontWeight: '600',
                }}>{biz.flag} suspicious</span>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '430px',
        background: 'white',
        borderTop: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0 20px',
      }}>
        <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', textDecoration: 'none' }}>
          <span style={{ fontSize: '20px' }}>⊞</span>
          <span style={{ fontSize: '11px', color: '#534AB7', fontWeight: '600' }}>Home</span>
        </Link>
        <Link href="/post-review" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', textDecoration: 'none' }}>
          <span style={{ fontSize: '20px' }}>⊕</span>
          <span style={{ fontSize: '11px', color: '#888' }}>Review</span>
        </Link>
        <Link href="/influencers" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', textDecoration: 'none' }}>
          <span style={{ fontSize: '20px' }}>✦</span>
          <span style={{ fontSize: '11px', color: '#888' }}>Influencers</span>
        </Link>
        <Link href="/profile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', textDecoration: 'none' }}>
          <span style={{ fontSize: '20px' }}>◯</span>
          <span style={{ fontSize: '11px', color: '#888' }}>Profile</span>
        </Link>
      </div>
    </main>
  )
}