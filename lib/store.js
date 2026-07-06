// lib/store.js
// ═══════════════════════════════════════════════════════════
// GLOBAL STORE — Uses localStorage so data persists across ALL pages
// Admin changes → saved to localStorage → all pages read from it
// ═══════════════════════════════════════════════════════════

const STORE_KEY = 'dragonbyte_store'

const INITIAL_DATA = {
  members: [
    { id:1, name:'0xAlex',     email:'alex@db.com',   role:'admin',    exp:'Advanced',     skills:['WEB','PWN','CRYPTO'],   joined:'2023-01-15' },
    { id:2, name:'DarkRaven',  email:'raven@db.com',  role:'player',   exp:'Intermediate', skills:['FORENSICS','OSINT'],    joined:'2023-03-20' },
    { id:3, name:'ZeroPulse',  email:'zero@db.com',   role:'player',   exp:'Advanced',     skills:['REV','PWN'],            joined:'2023-05-10' },
    { id:4, name:'NullX',      email:'null@db.com',   role:'beginner', exp:'Beginner',     skills:['WEB','CRYPTO'],         joined:'2024-01-05' },
    { id:5, name:'ByteStorm',  email:'byte@db.com',   role:'admin',    exp:'Advanced',     skills:['PWN','REV','WEB'],      joined:'2023-02-28' },
    { id:6, name:'GhostShell', email:'ghost@db.com',  role:'beginner', exp:'Beginner',     skills:['OSINT'],                joined:'2024-06-12' },
  ],
  events: [
    { id:1, title:'picoCTF 2025 Team Round',     type:'CTF',      status:'upcoming', date:'2025-03-28', time:'09:00', desc:'Join our team for the biggest beginner CTF of the year.', link:'https://picoctf.org',   org:'picoCTF'    },
    { id:2, title:'Web Exploitation Workshop',   type:'WORKSHOP', status:'upcoming', date:'2025-04-05', time:'18:00', desc:'XSS, SQLi, IDOR — live practice on vulnerable apps.',      link:'',                      org:'Internal'   },
    { id:3, title:'Reverse Engineering Talk',    type:'TALK',     status:'upcoming', date:'2025-04-15', time:'19:00', desc:'Intro to binary analysis with Ghidra and pwndbg.',         link:'',                      org:'Internal'   },
    { id:4, title:'HackTheBox Monthly',          type:'CTF',      status:'upcoming', date:'2025-04-22', time:'00:00', desc:'Monthly HTB challenge — compete for leaderboard points.',  link:'https://hackthebox.com', org:'HackTheBox' },
    { id:5, title:'CTFtime New Year Blast',      type:'CTF',      status:'past',     date:'2025-01-05', time:'',      desc:'3rd place overall finish.',                               link:'',                      org:'CTFtime'    },
    { id:6, title:'Linux Fundamentals Workshop', type:'WORKSHOP', status:'past',     date:'2025-02-10', time:'18:00', desc:'Bash scripting, file system, permissions, CTF tools.',    link:'',                      org:'Internal'   },
  ],
  requests: [],
  stats: {
    memberCount: 247,
    flagCount:   1420,
    teamCount:   15,
    eventCount:  38,
  },
  teamFinder: {
    enabled:      true,
    name:         'DragonByte Alpha Team',
    description:  'Looking for skilled players for upcoming CTF competitions. All skill levels welcome!',
    slots:        3,
    requirements: ['WEB', 'CRYPTO', 'FORENSICS'],
    teamMembers: [
      { name: '0xAlex',    role: 'CAPTAIN' },
      { name: 'ByteStorm', role: 'PWN'     },
      { name: 'ZeroPulse', role: 'REV'     },
    ],
  },
  flags: [
    { id:1, name:'Web_Warmup_1',      pts:100, cat:'web',       solved:true  },
    { id:2, name:'SQL_Injection_101', pts:150, cat:'web',       solved:true  },
    { id:3, name:'Caesar_Cipher',     pts:50,  cat:'crypto',    solved:true  },
    { id:4, name:'RSA_Easy',          pts:200, cat:'crypto',    solved:false },
    { id:5, name:'File_Forensics_1',  pts:100, cat:'forensics', solved:true  },
    { id:6, name:'Buffer_Overflow_0', pts:250, cat:'pwn',       solved:false },
    { id:7, name:'Ghidra_Starter',    pts:200, cat:'rev',       solved:true  },
  ],
  logs: [],
  nextId: 200,
}

// ── Read from localStorage ──
export function getStore() {
  if (typeof window === 'undefined') return JSON.parse(JSON.stringify(INITIAL_DATA))
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return JSON.parse(raw)
  } catch(e) {}
  // First time — save initial data
  saveStore(JSON.parse(JSON.stringify(INITIAL_DATA)))
  return JSON.parse(JSON.stringify(INITIAL_DATA))
}

// ── Write to localStorage ──
export function saveStore(data) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORE_KEY, JSON.stringify(data)) } catch(e) {}
}

// ── Update store helper ──
export function updateStore(updater) {
  const s = getStore()
  updater(s)
  saveStore(s)
  return s
}

// ── Reset to defaults ──
export function resetStore() {
  saveStore(JSON.parse(JSON.stringify(INITIAL_DATA)))
}

// ════════════════════════
// MEMBERS
// ════════════════════════
export function getMembers() { return getStore().members }

export function addMember(member) {
  updateStore(s => {
    s.members.unshift({ ...member, id: s.nextId++ })
  })
}

export function updateMember(id, data) {
  updateStore(s => {
    s.members = s.members.map(m => m.id === id ? { ...m, ...data } : m)
  })
}

export function deleteMember(id) {
  updateStore(s => {
    s.members = s.members.filter(m => m.id !== id)
  })
}

// ════════════════════════
// EVENTS
// ════════════════════════
export function getEvents() { return getStore().events }

export function addEvent(event) {
  updateStore(s => {
    s.events.unshift({ ...event, id: s.nextId++ })
  })
}

export function updateEvent(id, data) {
  updateStore(s => {
    s.events = s.events.map(e => e.id === id ? { ...e, ...data } : e)
  })
}

export function deleteEvent(id) {
  updateStore(s => {
    s.events = s.events.filter(e => e.id !== id)
  })
}

// ════════════════════════
// JOIN REQUESTS
// ════════════════════════
export function getRequests() { return getStore().requests }

export function addRequest(req) {
  updateStore(s => {
    s.requests.unshift({
      ...req,
      id: s.nextId++,
      status: 'pending',
      submittedAt: new Date().toLocaleString('en-GB', {
        day:'2-digit', month:'short', year:'numeric',
        hour:'2-digit', minute:'2-digit'
      })
    })
  })
}

export function updateRequest(id, data) {
  updateStore(s => {
    s.requests = s.requests.map(r => r.id === id ? { ...r, ...data } : r)
  })
}

export function deleteRequest(id) {
  updateStore(s => {
    s.requests = s.requests.filter(r => r.id !== id)
  })
}

// ════════════════════════
// HOME STATS
// ════════════════════════
export function getStats() { return getStore().stats }

export function updateStats(data) {
  updateStore(s => {
    s.stats = { ...s.stats, ...data }
  })
}

export function adjustStat(key, delta) {
  updateStore(s => {
    s.stats[key] = Math.max(0, (s.stats[key] || 0) + delta)
  })
}

export function setStatValue(key, value) {
  updateStore(s => {
    s.stats[key] = Math.max(0, parseInt(value) || 0)
  })
}

// ════════════════════════
// TEAM FINDER
// ════════════════════════
export function getTeamFinder() { return getStore().teamFinder }

export function updateTeamFinder(data) {
  updateStore(s => {
    s.teamFinder = { ...s.teamFinder, ...data }
  })
}

// ════════════════════════
// CTF FLAGS
// ════════════════════════
export function getFlags() { return getStore().flags }

export function addFlag(flag) {
  updateStore(s => {
    s.flags.push({ ...flag, id: s.nextId++ })
  })
}

export function toggleFlag(id) {
  updateStore(s => {
    s.flags = s.flags.map(f => f.id === id ? { ...f, solved: !f.solved } : f)
  })
}

export function deleteFlag(id) {
  updateStore(s => {
    s.flags = s.flags.filter(f => f.id !== id)
  })
}

// ════════════════════════
// ACTIVITY LOG
// ════════════════════════
export function addLog(msg) {
  updateStore(s => {
    s.logs.unshift({ time: new Date().toLocaleTimeString('en-GB'), msg })
    if (s.logs.length > 50) s.logs.pop()
  })
}

export function getLogs() { return getStore().logs }
