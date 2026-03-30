import { Suspense } from 'react'
import ChallengesContent from './ChallengesContent'

export default function ChallengesPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign:'center', padding:'4rem', fontFamily:'"Share Tech Mono",monospace', color:'#3a7a50', letterSpacing:'2px' }}>
        🐉 LOADING CHALLENGES...
      </div>
    }>
      <ChallengesContent />
    </Suspense>
  )
}