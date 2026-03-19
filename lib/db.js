// lib/db.js
// ALL database read/write functions
// Admin saves here → permanent for ALL visitors

import {
  collection, doc, getDocs, getDoc, addDoc, setDoc,
  updateDoc, deleteDoc, onSnapshot, serverTimestamp,
  query, orderBy
} from 'firebase/firestore'
import { db } from './firebase'

// ─── SETTINGS DOC (stats, team finder, flags, logs) ───
const SETTINGS_DOC = doc(db, 'settings', 'main')

const DEFAULT_SETTINGS = {
  stats: { memberCount:247, flagCount:1420, teamCount:15, eventCount:38 },
  teamFinder: {
    enabled: true,
    name: 'DragonByte Alpha Team',
    description: 'Looking for skilled players for upcoming CTF competitions!',
    slots: 3,
    requirements: ['WEB','CRYPTO','FORENSICS'],
    teamMembers: [
      { name:'0xAlex', role:'CAPTAIN' },
      { name:'ByteStorm', role:'PWN' },
    ],
  },
  flags: [
    { id:'f1', name:'Web_Warmup_1',      pts:100, cat:'web',       solved:true  },
    { id:'f2', name:'SQL_Injection_101', pts:150, cat:'web',       solved:true  },
    { id:'f3', name:'Caesar_Cipher',     pts:50,  cat:'crypto',    solved:true  },
    { id:'f4', name:'RSA_Easy',          pts:200, cat:'crypto',    solved:false },
    { id:'f5', name:'File_Forensics_1',  pts:100, cat:'forensics', solved:true  },
    { id:'f6', name:'Buffer_Overflow_0', pts:250, cat:'pwn',       solved:false },
    { id:'f7', name:'Ghidra_Starter',    pts:200, cat:'rev',       solved:true  },
  ],
  logs: [],
}

// ── Get or create settings ──
export async function getSettings() {
  try {
    const snap = await getDoc(SETTINGS_DOC)
    if (snap.exists()) return snap.data()
    await setDoc(SETTINGS_DOC, DEFAULT_SETTINGS)
    return DEFAULT_SETTINGS
  } catch(e) { console.error(e); return DEFAULT_SETTINGS }
}

// ── Listen to settings in real-time ──
export function listenSettings(cb) {
  return onSnapshot(SETTINGS_DOC, snap => {
    if (snap.exists()) cb(snap.data())
    else { setDoc(SETTINGS_DOC, DEFAULT_SETTINGS); cb(DEFAULT_SETTINGS) }
  }, err => console.error(err))
}

// ── Save stats ──
export async function saveStats(stats) {
  await updateDoc(SETTINGS_DOC, { stats })
}

// ── Save team finder ──
export async function saveTeamFinder(teamFinder) {
  await updateDoc(SETTINGS_DOC, { teamFinder })
}

// ── Save flags ──
export async function saveFlags(flags) {
  await updateDoc(SETTINGS_DOC, { flags })
}

// ── Add log entry ──
export async function addLog(msg) {
  try {
    const snap = await getDoc(SETTINGS_DOC)
    const logs = snap.exists() ? (snap.data().logs || []) : []
    const newLog = { time: new Date().toLocaleTimeString('en-GB'), msg }
    await updateDoc(SETTINGS_DOC, { logs: [newLog, ...logs].slice(0, 50) })
  } catch(e) { console.error(e) }
}

// ─── MEMBERS COLLECTION ───
export async function getMembers() {
  try {
    const snap = await getDocs(query(collection(db, 'members'), orderBy('createdAt', 'desc')))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch(e) { return [] }
}

export function listenMembers(cb) {
  return onSnapshot(
    query(collection(db, 'members'), orderBy('createdAt', 'desc')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => console.error(err)
  )
}

export async function addMember(data) {
  return addDoc(collection(db, 'members'), { ...data, createdAt: serverTimestamp() })
}

export async function updateMember(id, data) {
  return updateDoc(doc(db, 'members', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteMember(id) {
  return deleteDoc(doc(db, 'members', id))
}

// ─── EVENTS COLLECTION ───
export async function getEvents() {
  try {
    const snap = await getDocs(query(collection(db, 'events'), orderBy('date', 'desc')))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch(e) { return [] }
}

export function listenEvents(cb) {
  return onSnapshot(
    query(collection(db, 'events'), orderBy('date', 'desc')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => console.error(err)
  )
}

export async function addEvent(data) {
  return addDoc(collection(db, 'events'), { ...data, createdAt: serverTimestamp() })
}

export async function updateEvent(id, data) {
  return updateDoc(doc(db, 'events', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteEvent(id) {
  return deleteDoc(doc(db, 'events', id))
}

// ─── JOIN REQUESTS COLLECTION ───
export async function getRequests() {
  try {
    const snap = await getDocs(query(collection(db, 'join_requests'), orderBy('createdAt', 'desc')))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch(e) { return [] }
}

export function listenRequests(cb) {
  return onSnapshot(
    query(collection(db, 'join_requests'), orderBy('createdAt', 'desc')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => console.error(err)
  )
}

export async function addJoinRequest(data) {
  return addDoc(collection(db, 'join_requests'), {
    ...data, status: 'pending', createdAt: serverTimestamp()
  })
}

export async function updateRequest(id, data) {
  return updateDoc(doc(db, 'join_requests', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteRequest(id) {
  return deleteDoc(doc(db, 'join_requests', id))
}
