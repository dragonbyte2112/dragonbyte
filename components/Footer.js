// components/Footer.js
export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid #0f3020',
      padding: '2rem',
      textAlign: 'center',
      position: 'relative', zIndex: 1,
    }}>
      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.5rem' }}>
        <span style={{ color: '#00ff6e' }}>DRAGON</span>
        <span style={{ color: '#00d4ff' }}>BYTE</span>
      </div>
      <div style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '0.65rem', color: '#3a7a50', letterSpacing: '2px' }}>
        // LEARN · HACK · DEFEND · GROW // 2025
      </div>
    </footer>
  )
}
