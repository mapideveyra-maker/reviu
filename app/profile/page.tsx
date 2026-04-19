import Link from 'next/link'

export default function Profile() {
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
        <span style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>My Profile</span>
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>Settings</span>
      </div>

      <div style={{ background: 'white', padding: '1.25rem', marginBottom: '8px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#EEEDFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: '700',
            color: '#534AB7',
            flexShrink: 0,
          }}>ME</div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '2px' }}>My Account</div>
            <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Member since April 2026 · Cincinnati, OH</div>
            <div style={{
              display: 'inline-block',
              background: '#EAF3DE',
              color: '#3B6D11',
              fontSize: '11px',
              fontWeight: '700',
              padding: '3px 10px',
              borderRadius: '20px',
            }}>Verified Reviewer</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {[
            { label: 'Reviews', value: '12' },
            { label: 'Legitimacy', value: '94/100' },
            { label: 'Helpful votes', value: '48' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#f7f7f5', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: '16px', fontWeight: '700' }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'white', padding: '1.25rem', marginBottom: '8px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>My recent reviews</div>

        {[
          { biz: "Maria's Bakery & Cafe", stars: 5, text: 'Best croissants in Cincinnati. Always fresh and the staff is wonderful.', time: '2 weeks ago', score: 94 },
          { biz: 'Blue Lotus Yoga', stars: 5, text: 'Amazing classes and a very welcoming community.', time: '1 month ago', score: 94 },
          { biz: 'Kingpin Barber Co.', stars: 3, text: 'Good haircut but had to wait 45 minutes past my appointment.', time: '2 months ago', score: 94 },
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

      <div style={{ background: 'white', padding: '1.25rem', marginBottom: '8px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Account options</div>

        {[
          { label: 'Are you a business owner?', sub: 'Claim and manage your business', color: '#534AB7' },
          { label: 'Are you an influencer?', sub: 'Join the Reviu creator network', color: '#534AB7' },
          { label: 'Notification settings', sub: 'Manage your alerts', color: '#333' },
          { label: 'Privacy settings', sub: 'Control your data', color: '#333' },
          { label: 'Sign out', sub: '', color: '#A32D2D' },
        ].map(item => (
          <div key={item.label} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: '1px solid #f5f5f5',
            cursor: 'pointer',
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: item.color }}>{item.label}</div>
              {item.sub && <div style={{ fontSize: '12px', color: '#888' }}>{item.sub}</div>}
            </div>
            <span style={{ color: '#ccc', fontSize: '16px' }}>›</span>
          </div>
        ))}
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
          <span style={{ fontSize: '11px', color: '#534AB7', fontWeight: '600' }}>Profile</span>
        </Link>
      </div>
    </main>
  )
}