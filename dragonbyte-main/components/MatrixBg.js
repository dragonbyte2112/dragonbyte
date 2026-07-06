// components/MatrixBg.js
'use client'
import { useEffect, useRef } from 'react'

export default function MatrixBg() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Set canvas size to window size
    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Characters to rain down (binary + katakana + hex)
    const chars = '01アイウエオカキクケコ<>{}[]ABCDEF01'.split('')
    const cols  = Math.floor(canvas.width / 18)
    const drops = Array(cols).fill(1)

    const draw = () => {
      // Fade trail effect
      ctx.fillStyle = 'rgba(2, 12, 6, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = '14px "Share Tech Mono"'

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]

        // Occasionally flash red or blue instead of green
        if      (Math.random() > 0.98) ctx.fillStyle = '#ff2040'
        else if (Math.random() > 0.95) ctx.fillStyle = '#00d4ff'
        else                           ctx.fillStyle = '#00ff6e'

        ctx.globalAlpha = Math.random() * 0.5 + 0.3
        ctx.fillText(char, i * 18, drops[i] * 18)
        ctx.globalAlpha = 1

        // Reset drop to top randomly
        if (drops[i] * 18 > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      }
    }

    const interval = setInterval(draw, 60)
    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      id="matrix-canvas"
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0, opacity: 0.18, pointerEvents: 'none',
      }}
    />
  )
}
