/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E8713A',
        accent: '#F4A261',
        deep: '#1A0A2E',
        background: '#0D0618',
        foreground: '#FFF1E6',
        pink: '#E76F8A',
        'sky-start': '#2D1B4E',
        'sky-mid': '#7B3F6E',
        'sky-end': '#E8713A',
        'cream': '#FFF8F0',
        'warm-dark': '#1C0A20',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'idle-bob': 'idleBob 3s ease-in-out infinite',
        'idle-bob-slow': 'idleBobSlow 4s ease-in-out infinite',
        'float-heart': 'floatHeart 3s ease-out forwards',
        'twinkle': 'twinkle 2s ease-in-out infinite',
        'music-pulse': 'musicPulse 2s ease-in-out infinite',
        'sky-shift': 'skyShift 8s ease infinite',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in-scale': 'fadeInScale 0.6s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.8s ease-out forwards',
        'slide-in-right': 'slideInRight 0.8s ease-out forwards',
      },
      keyframes: {
        idleBob: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        idleBobSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(-1deg)' },
          '50%': { transform: 'translateY(-6px) rotate(1deg)' },
        },
        floatHeart: {
          '0%': { opacity: '0', transform: 'translateY(0) scale(0.5) rotate(-15deg)' },
          '20%': { opacity: '1' },
          '80%': { opacity: '0.6' },
          '100%': { opacity: '0', transform: 'translateY(-120px) scale(1.2) rotate(15deg)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        musicPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(232, 113, 58, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(232, 113, 58, 0)' },
        },
        skyShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(32px)', filter: 'blur(8px)' },
          to: { opacity: '1', transform: 'translateY(0)', filter: 'blur(0px)' },
        },
        fadeInScale: {
          from: { opacity: '0', transform: 'scale(0.92)', filter: 'blur(4px)' },
          to: { opacity: '1', transform: 'scale(1)', filter: 'blur(0px)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-40px)', filter: 'blur(8px)' },
          to: { opacity: '1', transform: 'translateX(0)', filter: 'blur(0px)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(40px)', filter: 'blur(8px)' },
          to: { opacity: '1', transform: 'translateX(0)', filter: 'blur(0px)' },
        },
      },
      backgroundSize: {
        '200%': '200% 200%',
      },
    },
  },
  plugins: [],
};