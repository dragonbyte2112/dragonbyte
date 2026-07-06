// app/layout.js
import './globals.css'
import Navbar from '../components/Navbar'
import MatrixBg from '../components/MatrixBg'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../lib/AuthContext'

export const metadata = {
  title: 'DragonByte — Learn. Hack. Defend. Grow.',
  description: 'Cybersecurity & CTF Community',
  metadataBase: new URL('https://dragonbyte.co.in'),
  icons: {
    icon: [
      { url: '/dragon_byte_new.png', sizes: '16x16',  type: 'image/png' },
      { url: '/dragon_byte_new.png', sizes: '32x32',  type: 'image/png' },
      { url: '/dragon_byte_new.png', sizes: '48x48',  type: 'image/png' },
      { url: '/dragon_byte_new.png', sizes: '192x192',type: 'image/png' },
    ],
    apple:    { url: '/dragon_byte_new.png', sizes: '180x180', type: 'image/png' },
    shortcut: { url: '/dragon_byte_new.png' },
  },
  openGraph: {
    title: 'DragonByte — Learn. Hack. Defend. Grow.',
    description: 'Cybersecurity & CTF Community',
    url: 'https://dragonbyte.co.in',
    siteName: 'DragonByte',
    images: [{ url: '/dragon_byte_new.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'DragonByte',
    description: 'Cybersecurity & CTF Community',
    images: ['/dragon_byte_new.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon"             href="/dragon_byte_new.png" type="image/png" />
        <link rel="shortcut icon"    href="/dragon_byte_new.png" type="image/png" />
        <link rel="apple-touch-icon" href="/dragon_byte_new.png" />
      </head>
      <body>
        <AuthProvider>
          <MatrixBg />
          <Navbar />
          <main style={{ position: 'relative', zIndex: 1, marginTop: '64px' }}>
            {children}
          </main>
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
        </AuthProvider>
      </body>
    </html>
  )
}