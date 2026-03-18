// lib/store.js
// ─────────────────────────────────────────────────────────
// Shared in-memory store — keeps data alive between pages
// In production: replace with Firebase Firestore calls
// ─────────────────────────────────────────────────────────

// Initial members list
const initialMembers = [
  { id:1, name:'0xAlex',     email:'alex@db.com',   role:'admin',    exp:'Advanced',     skills:['WEB','PWN','CRYPTO'],   joined:'2023-01-15' },
  { id:2, name:'DarkRaven',  email:'raven@db.com',  role:'player',   exp:'Intermediate', skills:['FORENSICS','OSINT'],    joined:'2023-03-20' },
  { id:3, name:'ZeroPulse',  email:'zero@db.com',   role:'player',   exp:'Advanced',     skills:['REV','PWN'],            joined:'2023-05-10' },
  { id:4, name:'NullX',      email:'null@db.com',   role:'beginner', exp:'Beginner',     skills:['WEB','CRYPTO'],         joined:'2024-01-05' },
  { id:5, name:'ByteStorm',  email:'byte@db.com',   role:'admin',    exp:'Advanced',     skills:['PWN','REV','WEB'],      joined:'2023-02-28' },
  { id:6, name:'GhostShell', email:'ghost@db.com',  role:'beginner', exp:'Beginner',     skills:['OSINT'],                joined:'2024-06-12' },
]

// Global store object — shared across all pages via window
if (typeof window !== 'undefined') {
  if (!window.__DB_STORE__) {
    window.__DB_STORE__ = {
      members:  [...initialMembers],
      requests: [],
      nextId:   100,
    }
  }
}

// Helper: get the store safely
export function getStore() {
  if (typeof window === 'undefined') return { members: [...initialMembers], requests: [], nextId: 100 }
  return window.__DB_STORE__
}

// Helper: add a join request
export function addJoinRequest(data) {
  const store = getStore()
  const request = {
    id: store.nextId++,
    ...data,
    status: 'pending',
    submittedAt: new Date().toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }),
  }
  store.requests.unshift(request) // add to top
  return request
}
