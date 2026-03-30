// app/page.js
'use client'
import Link from 'next/link'
import Footer from '../components/Footer'

export default function HomePage() {
  return (
    <>
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <h1 style={{
          fontFamily: 'Orbitron, monospace',
          fontSize: 'clamp(2rem, 6vw, 4rem)',
          fontWeight: 900,
          marginBottom: '1rem',
        }}>
          <span style={{ color: '#00ff6e' }}>DRAGON</span>
          <span style={{ color: '#00d4ff' }}>BYTE</span>
        </h1>

        <p style={{
          fontFamily: '"Share Tech Mono", monospace',
          color: '#3a7a50',
          fontSize: '0.85rem',
          letterSpacing: '3px',
          marginBottom: '2.5rem',
        }}>
          // LEARN · HACK · DEFEND · GROW // 2025 @sanjai
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/ctf" style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#020c06',
            background: '#00ff6e',
            padding: '10px 24px',
            borderRadius: 4,
            textDecoration: 'none',
            letterSpacing: '1px',
          }}>
            EXPLORE CTF 🚩
          </Link>
          <Link href="/register" style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#00d4ff',
            border: '1px solid #00d4ff',
            padding: '10px 24px',
            borderRadius: 4,
            textDecoration: 'none',
            letterSpacing: '1px',
          }}>
            JOIN NOW
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}