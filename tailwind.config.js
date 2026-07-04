/** @type {import('tailwindcss').Config} */
function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`
    }
    return `rgb(var(${variableName}))`
  }
}

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Stitch Design System — InterviewIQ AI
        // Colors stored as RGB channels in CSS vars to support /opacity syntax
        primary:                    withOpacity('--rgb-primary'),
        'primary-fixed':            '#e1e0ff',
        'primary-fixed-dim':        '#c0c1ff',
        'primary-container':        withOpacity('--rgb-primary-container'),
        'on-primary':               '#1000a9',
        'on-primary-fixed':         '#07006c',
        'on-primary-container':     '#0d0096',
        'inverse-primary':          '#494bd6',

        secondary:                  withOpacity('--rgb-secondary'),
        'secondary-fixed':          '#acedff',
        'secondary-fixed-dim':      '#4cd7f6',
        'secondary-container':      '#03b5d3',
        'on-secondary':             '#003640',
        'on-secondary-fixed':       '#001f26',
        'on-secondary-container':   '#00424e',

        tertiary:                   withOpacity('--rgb-tertiary'),
        'tertiary-fixed':           '#ffdcc5',
        'tertiary-fixed-dim':       '#ffb783',
        'tertiary-container':       '#d97721',
        'on-tertiary':              '#4f2500',
        'on-tertiary-container':    '#452000',

        background:                 withOpacity('--rgb-background'),
        surface:                    '#131313',
        'surface-dim':              '#131313',
        'surface-bright':           '#3a3939',
        'surface-variant':          '#353534',
        'surface-tint':             '#c0c1ff',
        'surface-container-lowest': withOpacity('--rgb-surface-container-lowest'),
        'surface-container-low':    withOpacity('--rgb-surface-container-low'),
        'surface-container':        withOpacity('--rgb-surface-container'),
        'surface-container-high':   withOpacity('--rgb-surface-container-high'),
        'surface-container-highest':'#353534',

        'on-background':            '#e5e2e1',
        'on-surface':               '#e5e2e1',
        'on-surface-variant':       '#c7c4d7',
        'inverse-surface':          '#e5e2e1',
        'inverse-on-surface':       '#313030',

        outline:                    '#908fa0',
        'outline-variant':          '#464554',

        error:                      '#ffb4ab',
        'error-container':          '#93000a',
        'on-error':                 '#690005',
        'on-error-container':       '#ffdad6',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
        display: ['Geist', 'sans-serif'],
      },
      fontSize: {
        'display-lg':        ['48px', { lineHeight: '56px', letterSpacing: '-0.04em', fontWeight: '700' }],
        'display-md':        ['40px', { lineHeight: '48px', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-lg-mobile': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-md':       ['24px', { lineHeight: '32px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'body-lg':           ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md':           ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-sm':          ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '500' }],
        'label-xs':          ['10px', { lineHeight: '14px', letterSpacing: '0.05em', fontWeight: '500' }],
      },
      spacing: {
        'xs':            '4px',
        'sm':            '8px',
        'md':            '16px',
        'lg':            '24px',
        'xl':            '40px',
        'gutter':        '24px',
        'container-max': '1280px',
      },
      maxWidth: {
        'container-max': '1280px',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg:      '0.5rem',
        xl:      '0.75rem',
        '2xl':   '1rem',
        '3xl':   '1.5rem',
        '4xl':   '2rem',
        full:    '9999px',
      },
      boxShadow: {
        'ai-glow':    '0px 0px 20px rgba(99, 102, 241, 0.15)',
        'ai-glow-lg': '0px 0px 40px rgba(192, 193, 255, 0.2)',
        'primary':    '0 8px 32px rgba(192, 193, 255, 0.2)',
        'cta':        '0 0 30px rgba(192, 193, 255, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':      'float 6s ease-in-out infinite',
        'blink':      'blink 1s step-end infinite',
        'fade-in':    'fadeIn 0.3s ease-out forwards',
        'slide-up':   'slideUp 0.5s ease-out forwards',
        'shimmer':    'shimmer 2s infinite linear',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to:   { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [],
}
