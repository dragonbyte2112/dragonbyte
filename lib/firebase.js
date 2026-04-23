// lib/firebase.js
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyCOR0g2j-aSdE8H9s8H0H-YwzLgBvfjb38",
  authDomain: "dragonbyte-15c76.firebaseapp.com",
  projectId: "dragonbyte-15c76",
  storageBucket: "dragonbyte-15c76.appspot.com", // ✅ FIXED
  messagingSenderId: "291609933098",
  appId: "1:291609933098:web:b3cd5517ec8c08f8701a53",
}

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0]

export const db      = getFirestore(app)
export const auth    = getAuth(app)
export const storage = getStorage(app)

export default app