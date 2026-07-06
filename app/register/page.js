// app/register/page.js
'use client'
import { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { createUserProfile } from '../../lib/ctf'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

const I = { width:'100%', background:'#030f08', border:'1px solid #0f3020', borderRadius:4, padding:'11px 14px', color:'#b0ffcc', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.82rem', outline:'none', marginBottom:'1rem' }
const L = { fontFamily:'"Share Tech Mono",monospace', fontSize:'0.63rem', color:'#00cc55', letterSpacing:'2px', display:'block', marginBottom:5 }

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [pass,     setPass]     = useState('')
  const [pass2,    setPass2]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handle = async () => {
    setError('')
    if (!username.trim()) { setError('Enter a username/handle'); return }
    if (!email)           { setError('Enter your email'); return }
    if (pass.length < 6)  { setError('Password must be at least 6 characters'); return }
    if (pass !== pass2)   { setError('Passwords do not match'); return }

    setLoading(true)
    try {
      // Create Firebase auth account
      const cred = await createUserWithEmailAndPassword(auth, email, pass)
      await updateProfile(cred.user, { displayName: username })

      // Create user profile in Firestore
      await createUserProfile(cred.user.uid, {
        username:  username.trim(),
        email:     email.trim(),
        role:      'player',
        points:    0,
        solveCount:0,
      })

      toast.success('✓ Account created! Welcome to DragonByte!')
      router.push('/ctf')
    } catch(e) {
      if (e.code === 'auth/email-already-in-use') setError('Email already registered')
      else if (e.code === 'auth/weak-password')   setError('Password too weak')
      else setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh', padding:'2rem' }}>
      <div style={{ background:'#071a0e', border:'1px solid #0f3020', borderTop:'3px solid #00d4ff', borderRadius:8, padding:'2.5rem', width:'100%', maxWidth:440 }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>🐉</div>
          <div style={{ fontFamily:'Orbitron,monospace', fontSize:'1rem', color:'#00d4ff', letterSpacing:'3px' }}>CREATE ACCOUNT</div>
          <div style={{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.65rem', color:'#3a7a50', letterSpacing:'2px', marginTop:4 }}>// JOIN THE CTF PLATFORM</div>
        </div>

        {error && <div style={{ background:'#ff204015', border:'1px solid #cc0020', borderRadius:4, padding:'0.75rem 1rem', marginBottom:'1rem', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.72rem', color:'#ff2040' }}>✖ {error}</div>}

        <label style={L}>USERNAME / HANDLE *</label>
        <input style={I} placeholder="0xYourHandle" value={username} onChange={e=>setUsername(e.target.value)} />
        <label style={L}>EMAIL *</label>
        <input style={I} type="email" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} />
        <label style={L}>PASSWORD *</label>
        <input style={I} type="password" placeholder="Min 6 characters" value={pass} onChange={e=>setPass(e.target.value)} />
        <label style={L}>CONFIRM PASSWORD *</label>
        <input style={I} type="password" placeholder="Repeat password" value={pass2} onChange={e=>setPass2(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()} />

        <button onClick={handle} disabled={loading} style={{ width:'100%', fontFamily:'Orbitron,monospace', fontSize:'0.75rem', fontWeight:700, color:'#020c06', background:loading?'#006688':'#00d4ff', padding:12, border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'3px' }}>
          {loading ? '⟳ CREATING ACCOUNT...' : 'CREATE ACCOUNT →'}
        </button>

        <div style={{ textAlign:'center', marginTop:'1.5rem', fontFamily:'"Share Tech Mono",monospace', fontSize:'0.7rem', color:'#3a7a50' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color:'#00ff6e', textDecoration:'none' }}>LOGIN HERE</Link>
        </div>
      </div>
    </div>
  )
}
