// lib/ctf.js
import {
  collection, doc, getDocs, getDoc, addDoc, setDoc,
  updateDoc, deleteDoc, onSnapshot, serverTimestamp,
  query, orderBy, where, increment, runTransaction
} from 'firebase/firestore'
import { db } from './firebase'

// ─── CHALLENGES ───
export async function getChallenges() {
  try {
    const snap = await getDocs(query(collection(db, 'challenges'), orderBy('category')))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch(e) { return [] }
}

export function listenChallenges(cb) {
  return onSnapshot(
    query(collection(db, 'challenges'), orderBy('category')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => console.error(err)
  )
}

export async function addChallenge(data) {
  return addDoc(collection(db, 'challenges'), {
    ...data,
    solveCount: 0,
    published: true,
    createdAt: serverTimestamp(),
  })
}

export async function updateChallenge(id, data) {
  return updateDoc(doc(db, 'challenges', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteChallenge(id) {
  return deleteDoc(doc(db, 'challenges', id))
}

// ─── FLAG SUBMISSION ───
export async function submitFlag(userId, username, challengeId, challenge, flagInput) {
  const correctFlag = challenge.flag.trim().toLowerCase()
  const submitted   = flagInput.trim().toLowerCase()

  // Check if already solved
  const solvedRef = doc(db, 'submissions', `${userId}_${challengeId}`)
  const solvedSnap = await getDoc(solvedRef)
  if (solvedSnap.exists() && solvedSnap.data().correct) {
    return { success: false, message: 'Already solved!' }
  }

  // Rate limit (max 5 per minute)
  const attemptsRef = collection(db, 'attempts')
  const oneMinAgo = new Date(Date.now() - 60000)

  const recentSnap = await getDocs(
    query(attemptsRef,
      where('userId', '==', userId),
      where('challengeId', '==', challengeId),
    )
  )

  const recentAttempts = recentSnap.docs.filter(d => {
    const t = d.data().timestamp?.toDate?.()
    return t && t > oneMinAgo
  })

  if (recentAttempts.length >= 5) {
    return { success: false, message: 'Too many attempts! Wait 1 minute.' }
  }

  // Log attempt
  await addDoc(attemptsRef, {
    userId,
    username,
    challengeId,
    flag: flagInput,
    correct: submitted === correctFlag,
    timestamp: serverTimestamp(),
  })

  // Wrong flag
  if (submitted !== correctFlag) {
    return { success: false, message: 'Wrong flag! Try again.' }
  }

  // ✅ FIXED TRANSACTION
  await runTransaction(db, async (tx) => {

    const scoreRef = doc(db, 'scores', userId)

    // ✅ READ FIRST (THIS FIXES YOUR ERROR)
    const scoreSnap = await tx.get(scoreRef)

    // ✅ NOW WRITES

    // Save submission
    tx.set(solvedRef, {
      userId,
      username,
      challengeId,
      challengeName: challenge.title,
      points: challenge.points,
      correct: true,
      solvedAt: serverTimestamp(),
    })

    // Update challenge solve count
    tx.update(doc(db, 'challenges', challengeId), {
      solveCount: increment(1)
    })

    // Update score
    if (scoreSnap.exists()) {
      tx.update(scoreRef, {
        points: increment(challenge.points),
        solveCount: increment(1),
        lastSolveAt: serverTimestamp(),
      })
    } else {
      tx.set(scoreRef, {
        userId,
        username,
        points: challenge.points,
        solveCount: 1,
        lastSolveAt: serverTimestamp(),
      })
    }
  })

  return {
    success: true,
    message: `🎉 Correct! +${challenge.points} points!`,
    points: challenge.points
  }
}

// ─── USER SOLVES ───
export async function hasSolved(userId, challengeId) {
  try {
    const snap = await getDoc(doc(db, 'submissions', `${userId}_${challengeId}`))
    return snap.exists() && snap.data().correct
  } catch(e) { return false }
}

export async function getUserSolves(userId) {
  try {
    const snap = await getDocs(query(collection(db, 'submissions'), where('userId', '==', userId)))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch(e) { return [] }
}

// ─── LEADERBOARD ───
export function listenLeaderboard(cb) {
  return onSnapshot(
    query(collection(db, 'scores'), orderBy('points', 'desc'), orderBy('lastSolveAt', 'asc')),
    snap => cb(snap.docs.map((d, i) => ({ id: d.id, rank: i + 1, ...d.data() }))),
    err => console.error(err)
  )
}

export async function getLeaderboard() {
  try {
    const snap = await getDocs(query(collection(db, 'scores'), orderBy('points', 'desc')))
    return snap.docs.map((d, i) => ({ id: d.id, rank: i + 1, ...d.data() }))
  } catch(e) { return [] }
}

// ─── USER PROFILE ───
export async function getUserProfile(userId) {
  try {
    const snap = await getDoc(doc(db, 'users', userId))
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
  } catch(e) { return null }
}

export async function createUserProfile(userId, data) {
  return setDoc(doc(db, 'users', userId), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

export async function updateUserProfile(userId, data) {
  return updateDoc(doc(db, 'users', userId), data)
}

// ─── CTF SETTINGS ───
export async function getCTFSettings() {
  try {
    const snap = await getDoc(doc(db, 'ctf_settings', 'main'))
    return snap.exists() ? snap.data() : {
      name: 'DragonByte CTF',
      active: true,
      startTime: null,
      endTime: null,
      description: 'Welcome to DragonByte CTF!',
    }
  } catch(e) { return { active: true } }
}

export async function saveCTFSettings(data) {
  return setDoc(doc(db, 'ctf_settings', 'main'), {
    ...data,
    updatedAt: serverTimestamp()
  })
}

// ─── RESET SCORES ───
export async function resetAllScores() {
  const scoreDocs = await getDocs(collection(db, 'scores'))
  const subDocs   = await getDocs(collection(db, 'submissions'))
  const attDocs   = await getDocs(collection(db, 'attempts'))

  await Promise.all([
    ...scoreDocs.docs.map(d => deleteDoc(d.ref)),
    ...subDocs.docs.map(d => deleteDoc(d.ref)),
    ...attDocs.docs.map(d => deleteDoc(d.ref)),
  ])

  const chalDocs = await getDocs(collection(db, 'challenges'))
  await Promise.all(
    chalDocs.docs.map(d => updateDoc(d.ref, { solveCount: 0 }))
  )
}