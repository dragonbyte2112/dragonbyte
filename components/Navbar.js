// components/Navbar.js
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// All navigation links
const links = [
  { href: '/',            label: 'HOME' },
  { href: '/about',       label: 'ABOUT' },
  { href: '/members',     label: 'MEMBERS' },
  { href: '/events',      label: 'EVENTS' },
  { href: '/team-finder', label: 'TEAM FINDER' },
  { href: '/admin',       label: 'ADMIN' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: '#020c06ee', borderBottom: '1px solid #0f3020',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem', height: '64px',
    }}>

      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'radial-gradient(circle,#0a3018,#020c06)',
          border: '1.5px solid #00cc55',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, boxShadow: '0 0 12px #00ff6e44',
        }}>🐉</div>
        <span style={{
          fontFamily: 'Orbitron, monospace', fontSize: '0.95rem',
          fontWeight: 900, letterSpacing: '2px',
        }}>
          <span style={{ color: '#00ff6e' }}>DRAGON</span>
          <span style={{ color: '#00d4ff' }}>BYTE</span>
        </span>
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
        {links.map(({ href, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} style={{
              fontFamily: '"Share Tech Mono", monospace',
              fontSize: '0.72rem', letterSpacing: '1px',
              color: active ? '#00ff6e' : '#3a7a50',
              padding: '6px 12px',
              border: active ? '1px solid #00cc55' : '1px solid transparent',
              borderRadius: 4,
              background: active ? '#00ff6e10' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
              {label}
            </Link>
          )
        })}
      </div>

      {/* CTA Button */}
      <Link href="/join" className="btn-primary" style={{ fontSize: '0.65rem', padding: '8px 16px' }}>
        JOIN NOW
      </Link>
    </nav>
  )
}
