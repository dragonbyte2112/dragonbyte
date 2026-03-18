/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'db-green': '#00ff6e',
        'db-green2': '#00cc55',
        'db-blue': '#00d4ff',
        'db-blue2': '#0099cc',
        'db-red': '#ff2040',
        'db-bg': '#020c06',
        'db-card': '#071a0e',
        'db-border': '#0f3020',
      },
      fontFamily: {
        cyber: ['Orbitron', 'monospace'],
        mono: ['"Share Tech Mono"', 'monospace'],
        body: ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'pulse-green': 'pulseGreen 2s ease-in-out infinite',
        'scan': 'scan 4s linear infinite',
        'fadeUp': 'fadeUp 0.6s ease both',
      },
      keyframes: {
        pulseGreen: {
          '0%,100%': { boxShadow: '0 0 20px #00ff6e40' },
          '50%': { boxShadow: '0 0 50px #00ff6e80' },
        },
        scan: {
          '0%': { top: '-2px' },
          '100%': { top: '100%' },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
