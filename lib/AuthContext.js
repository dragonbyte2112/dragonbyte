// lib/AuthContext.js
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { getUserProfile } from './ctf'

// ✅ CHANGED: safe default instead of null
const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  setProfile: () => {},
})

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const p = await getUserProfile(firebaseUser.uid)
        setProfile(p)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, setProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}