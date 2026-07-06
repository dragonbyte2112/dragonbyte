// components/Navbar.js
'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'
import toast from 'react-hot-toast'

const LINKS = [
  { href:'/',            label:'HOME' },
  { href:'/about',       label:'ABOUT' },
  { href:'/members',     label:'MEMBERS' },
  { href:'/events',      label:'EVENTS' },
  { href:'/ctf',         label:'CTF 🚩' },
  { href:'/team-finder', label:'TEAM FINDER' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, profile } = useAuth()

  const handleLogout = async () => {
    await signOut(auth)
    toast.success('Logged out!')
    router.push('/')
  }

  return (
    <nav style={{
      position:'fixed', top:0, left:0, right:0, zIndex:100,
      background:'#020c06ee', borderBottom:'1px solid #0f3020',
      backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center',
      justifyContent:'space-between',
      padding:'0 1.5rem', height:'64px', gap:'0.5rem',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none', flexShrink:0 }}>
        <Image
          src="/dragon_byte_new.png"
          alt="DragonByte"
          width={48}
          height={48}
          style={{ borderRadius:'50%', objectFit:'cover' }}
          priority
        />
      </Link>

      {/* Nav links */}
      <div style={{ display:'flex', gap:'0.15rem', alignItems:'center', flexWrap:'wrap' }}>
        {LINKS.map(({ href, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} style={{
              fontFamily:'"Share Tech Mono",monospace', fontSize:'0.68rem', letterSpacing:'1px',
              color: active ? '#00ff6e' : '#3a7a50',
              padding:'5px 10px',
              border: active ? '1px solid #00cc55' : '1px solid transparent',
              borderRadius:4, background: active ? '#00ff6e10' : 'transparent',
              textDecoration:'none', transition:'all 0.2s',
            }}>{label}</Link>
          )
        })}
        <Link href="/admin" style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.68rem', color:'#ff2040', padding:'5px 10px', border:'1px solid transparent', borderRadius:4, textDecoration:'none' }}>ADMIN</Link>
      </div>

      {/* Auth buttons */}
      <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', flexShrink:0 }}>
        {user ? (
          <>
            <Link href="/profile" style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:'#00d4ff', textDecoration:'none', letterSpacing:'1px' }}>
              👤 {profile?.username || user.displayName || 'PLAYER'}
            </Link>
            <button onClick={handleLogout} style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.62rem', color:'#3a7a50', background:'transparent', border:'1px solid #0f3020', padding:'5px 12px', borderRadius:4, cursor:'pointer' }}>
              LOGOUT
            </button>
          </>
        ) : (
          <>
            <Link href="/login" style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:'#3a7a50', padding:'5px 12px', border:'1px solid #0f3020', borderRadius:4, textDecoration:'none' }}>
              LOGIN
            </Link>
            <Link href="/register" style={{ fontFamily:'Orbitron,monospace', fontSize:'0.62rem', fontWeight:700, color:'#020c06', background:'#00ff6e', padding:'6px 14px', borderRadius:4, textDecoration:'none', letterSpacing:'1px' }}>
              REGISTER
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}