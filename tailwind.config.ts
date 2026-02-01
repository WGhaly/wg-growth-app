import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0F0F0F',
          secondary: '#1A1A1A',
          tertiary: '#2A2A2A',
        },
        text: {
          primary: '#F5F5F5',
          secondary: '#B3B3B3',
          tertiary: '#808080',
        },
        accent: {
          primary: '#ccab52',
          hover: '#ddbf6b',
          active: '#b89641',
        },
        border: {
          subtle: '#2A2A2A',
          default: '#404040',
          strong: '#5A5A5A',
        },
        success: {
          bg: '#1A2E1A',
          border: '#2D4A2D',
          text: '#7FD17F',
        },
        warning: {
          bg: '#2E2A1A',
          border: '#4A442D',
          text: '#FFD166',
        },
        error: {
          bg: '#2E1A1A',
          border: '#4A2D2D',
          text: '#FF6B6B',
        },
        info: {
          bg: '#1A1F2E',
          border: '#2D3A4A',
          text: '#6BA3FF',
        },
        category: {
          faith: '#7A6F9E',
          character: '#9E7A6F',
          health: '#6F9E7A',
          finance: '#9E8F6F',
          business: '#7A8F9E',
          relationships: '#9E6F8F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '5xl': ['48px', '56px'],
        '4xl': ['36px', '44px'],
        '3xl': ['30px', '38px'],
        '2xl': ['24px', '32px'],
        'xl': ['20px', '28px'],
        'lg': ['18px', '26px'],
        'base': ['16px', '24px'],
        'sm': ['14px', '20px'],
        'xs': ['12px', '16px'],
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-in-out',
        'slide-up': 'slideUp 300ms ease-out',
        'shimmer': 'shimmer 2s infinite',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}

export default config
