// lib/store.js
// ═══════════════════════════════════════════════════════
// GLOBAL STORE — Single source of truth for entire website
// All pages read from here, Admin writes to here
// Changes in Admin → instantly reflect on ALL pages
// ═══════════════════════════════════════════════════════

const INITIAL_MEMBERS = [
  { id:1, name:'0xAlex',     email:'alex@db.com',   role:'admin',    exp:'Advanced',     skills:['WEB','PWN','CRYPTO'],   joined:'2023-01-15' },
  { id:2, name:'DarkRaven',  email:'raven@db.com',  role:'player',   exp:'Intermediate', skills:['FORENSICS','OSINT'],    joined:'2023-03-20' },
  { id:3, name:'ZeroPulse',  email:'zero@db.com',   role:'player',   exp:'Advanced',     skills:['REV','PWN'],            joined:'2023-05-10' },
  { id:4, name:'NullX',      email:'null@db.com',   role:'beginner', exp:'Beginner',     skills:['WEB','CRYPTO'],         joined:'2024-01-05' },
  { id:5, name:'ByteStorm',  email:'byte@db.com',   role:'admin',    exp:'Advanced',     skills:['PWN','REV','WEB'],      joined:'2023-02-28' },
  { id:6, name:'GhostShell', email:'ghost@db.com',  role:'beginner', exp:'Beginner',     skills:['OSINT'],                joined:'2024-06-12' },
]

const INITIAL_EVENTS = [
  { id:1, title:'picoCTF 2025 Team Round',     type:'CTF',      status:'upcoming', date:'2025-03-28', time:'09:00', desc:'Join our team for the biggest beginner CTF of the year. All skill levels welcome.', link:'https://picoctf.org',   org:'picoCTF'    },
  { id:2, title:'Web Exploitation Workshop',   type:'WORKSHOP', status:'upcoming', date:'2025-04-05', time:'18:00', desc:'XSS, SQLi, IDOR — live practice on intentionally vulnerable apps.',                link:'',                      org:'Internal'   },
  { id:3, title:'Reverse Engineering Talk',    type:'TALK',     status:'upcoming', date:'2025-04-15', time:'19:00', desc:'Introduction to binary analysis with Ghidra and pwndbg.',                        link:'',                      org:'Internal'   },
  { id:4, title:'HackTheBox Monthly',          type:'CTF',      status:'upcoming', date:'2025-04-22', time:'00:00', desc:'Monthly HTB challenge — compete for community leaderboard points.',               link:'https://hackthebox.com', org:'HackTheBox' },
  { id:5, title:'CTFtime New Year Blast',      type:'CTF',      status:'past',     date:'2025-01-05', time:'',      desc:'Community participation in New Year CTF. 3rd place overall finish.',             link:'',                      org:'CTFtime'    },
  { id:6, title:'Linux Fundamentals Workshop', type:'WORKSHOP', status:'past',     date:'2025-02-10', time:'18:00', desc:'Covered bash scripting, file system, permissions, and CTF tools.',               link:'',                      org:'Internal'   },
]

// ── Initialize global store once ──
function initStore() {
  if (typeof window === 'undefined') return
  if (!window.__DRAGONBYTE__) {
    window.__DRAGONBYTE__ = {
      members:  [...INITIAL_MEMBERS],
      events:   [...INITIAL_EVENTS],
      requests: [],
      nextId:   200,
    }
  }
}

// ── Get store ──
export function getStore() {
  if (typeof window === 'undefined') {
    return { members: [...INITIAL_MEMBERS], events: [...INITIAL_EVENTS], requests: [], nextId: 200 }
  }
  initStore()
  return window.__DRAGONBYTE__
}

// ── Members ──
export function getMembers()          { return getStore().members }
export function setMembers(m)         { const s = getStore(); s.members = m }
export function addMember(member)     { const s = getStore(); s.members.unshift({ ...member, id: s.nextId++ }) }
export function updateMember(id, data){ const s = getStore(); s.members = s.members.map(m => m.id === id ? { ...m, ...data } : m) }
export function deleteMember(id)      { const s = getStore(); s.members = s.members.filter(m => m.id !== id) }

// ── Events ──
export function getEvents()           { return getStore().events }
export function setEvents(e)          { const s = getStore(); s.events = e }
export function addEvent(event)       { const s = getStore(); s.events.unshift({ ...event, id: s.nextId++ }) }
export function updateEvent(id, data) { const s = getStore(); s.events = s.events.map(e => e.id === id ? { ...e, ...data } : e) }
export function deleteEvent(id)       { const s = getStore(); s.events = s.events.filter(e => e.id !== id) }

// ── Join Requests ──
export function getRequests()         { return getStore().requests }
export function addRequest(req)       {
  const s = getStore()
  s.requests.unshift({
    ...req,
    id: s.nextId++,
    status: 'pending',
    submittedAt: new Date().toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  })
}
export function updateRequest(id, data){ const s = getStore(); s.requests = s.requests.map(r => r.id === id ? { ...r, ...data } : r) }
export function deleteRequest(id)      { const s = getStore(); s.requests = s.requests.filter(r => r.id !== id) }

// ── Stats ──
export function getStats() {
  const s = getStore()
  return {
    totalMembers: s.members.length,
    totalEvents:  s.events.length,
    upcomingEvents: s.events.filter(e => e.status === 'upcoming').length,
    pendingRequests: s.requests.filter(r => r.status === 'pending').length,
  }
}
