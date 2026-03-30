// app/login/page.js
'use client'
import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

const I = { width:'100%', background:'#030f08', border:'1px solid #0f3020', borderRadius:4, padding:'11px 14px', color:'#b0ffcc', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.82rem', outline:'none', marginBottom:'1rem' }
const L = { fontFamily:'"Share Tech Mono",monospace', fontSize:'0.63rem', color:'#00cc55', letterSpacing:'2px', display:'block', marginBottom:5 }

export default function LoginPage() {
  const router = useRouter()
  const [email,   setEmail]   = useState('')
  const [pass,    setPass]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handle = async () => {
    if (!email || !pass) { setError('Fill all fields'); return }
    setLoading(true); setError('')
    try {
      await signInWithEmailAndPassword(auth, email, pass)
      toast.success('✓ Welcome back!')
      router.push('/ctf')
    } catch(e) {
      setError(e.code === 'auth/invalid-credential' ? 'Invalid email or password' : e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh', padding:'2rem' }}>
      <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderTop:'3px solid #00ff6e', borderRadius:8, padding:'2.5rem', width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>🐉</div>
          <div style={{ fontFamily:'Orbitron,monospace', fontSize:'1rem', color:'#00ff6e', letterSpacing:'3px' }}>PLAYER LOGIN</div>
          <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:'#3a7a50', letterSpacing:'2px', marginTop:4 }}>// ACCESS CTF PLATFORM</div>
        </div>

        {error && <div style={{ background:'#ff204015', border:'1px solid #cc0020', borderRadius:4, padding:'0.75rem 1rem', marginBottom:'1rem', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.72rem', color:'#ff2040' }}>✖ {error}</div>}

        <label style={L}>EMAIL</label>
        <input style={I} type="email" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()} />
        <label style={L}>PASSWORD</label>
        <input style={I} type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()} />

        <button onClick={handle} disabled={loading} style={{ width:'100%', fontFamily:'Orbitron,monospace', fontSize:'0.75rem', fontWeight:700, color:'#020c06', background:loading?'#009944':'#00ff6e', padding:12, border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'3px' }}>
          {loading ? '⟳ LOGGING IN...' : 'LOGIN →'}
        </button>

        <div style={{ textAlign:'center', marginTop:'1.5rem', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', color:'#3a7a50' }}>
          No account?{' '}
          <Link href="/register" style={{ color:'#00ff6e', textDecoration:'none' }}>REGISTER HERE</Link>
        </div>
      </div>
    </div>
  )
}
