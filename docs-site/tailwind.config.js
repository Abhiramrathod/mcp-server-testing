/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        term: {
          bg: '#0a0a0a',
          surface: '#111111',
          surface2: '#1a1a1a',
          border: '#1e1e1e',
          text: '#e0e0e0',
          dim: '#666666',
          dimmer: '#444444',
          green: '#5fffa7',
          'green-dim': 'rgba(95, 255, 167, 0.15)',
          amber: '#ff9f1c',
          red: '#ff4444',
          blue: '#60a5fa',
          purple: '#a78bfa',
          cyan: '#22d3ee',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 0.15s ease-in-out 3',
        'cursor-blink': 'cursorBlink 1s step-end infinite',
        'type': 'type 0.05s steps(1) forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'float-particle': 'floatParticle 20s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        cursorBlink: {
          '0%, 100%': { borderRightColor: 'rgba(95, 255, 167, 0.75)' },
          '50%': { borderRightColor: 'transparent' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 8px rgba(95, 255, 167, 0.15)' },
          '100%': { boxShadow: '0 0 24px rgba(95, 255, 167, 0.3)' },
        },
        floatParticle: {
          '0%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(10px, -15px)' },
          '50%': { transform: 'translate(-5px, -25px)' },
          '75%': { transform: 'translate(-15px, -10px)' },
          '100%': { transform: 'translate(0, 0)' },
        },
      },
    },
  },
  plugins: [],
}
