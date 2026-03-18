// app/layout.js
import './globals.css'
import Navbar from '../components/Navbar'
import MatrixBg from '../components/MatrixBg'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'DragonByte — Learn. Hack. Defend. Grow.',
  description: 'Cybersecurity & CTF Community',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Animated matrix rain background */}
        <MatrixBg />

        {/* Top navigation bar */}
        <Navbar />

        {/* Page content */}
        <main style={{ position: 'relative', zIndex: 1, marginTop: '64px' }}>
          {children}
        </main>

        {/* Toast notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#071a0e',
              color: '#00ff6e',
              border: '1px solid #00cc55',
              fontFamily: '"Share Tech Mono", monospace',
              fontSize: '0.75rem',
              letterSpacing: '1px',
            },
          }}
        />
      </body>
    </html>
  )
}
