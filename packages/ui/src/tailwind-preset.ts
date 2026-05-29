import type { Config } from 'tailwindcss'

const rgb = (v: string) => `rgb(${v} / <alpha-value>)`

const maccionPreset: Partial<Config> = {
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        navy:         rgb('var(--m-navy)'),
        'navy-dark':  rgb('var(--m-navy-dark)'),
        green:        rgb('var(--m-green)'),
        'green-dark': rgb('var(--m-green-dark)'),
        blue:         rgb('var(--m-blue)'),
        'blue-dark':  rgb('var(--m-blue-dark)'),
        'gray-bg':    rgb('var(--m-gray-bg)'),

        background:   rgb('var(--background)'),
        foreground:   rgb('var(--foreground)'),
        card: {
          DEFAULT:    rgb('var(--card)'),
          foreground: rgb('var(--card-foreground)'),
        },
        popover: {
          DEFAULT:    rgb('var(--popover)'),
          foreground: rgb('var(--popover-foreground)'),
        },
        primary: {
          DEFAULT:    rgb('var(--primary)'),
          foreground: rgb('var(--primary-foreground)'),
        },
        secondary: {
          DEFAULT:    rgb('var(--secondary)'),
          foreground: rgb('var(--secondary-foreground)'),
        },
        accent: {
          DEFAULT:    rgb('var(--accent)'),
          foreground: rgb('var(--accent-foreground)'),
        },
        muted: {
          DEFAULT:    rgb('var(--muted)'),
          foreground: rgb('var(--muted-foreground)'),
        },
        destructive: {
          DEFAULT:    rgb('var(--destructive)'),
          foreground: rgb('var(--destructive-foreground)'),
        },
        border: rgb('var(--border)'),
        input:  rgb('var(--input)'),
        ring:   rgb('var(--ring)'),

        'status-ok':   rgb('var(--m-st-ok)'),
        'status-warn': rgb('var(--m-st-warn)'),
        'status-down': rgb('var(--m-st-down)'),
        'status-info': rgb('var(--m-st-info)'),
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm:  'var(--radius)',
        md:  'var(--radius)',
        lg:  'var(--radius)',
        xl:  'var(--radius)',
        '2xl': 'var(--radius)',
        full: '9999px',
      },
      fontFamily: {
        sans:    ['var(--font-body)'],
        display: ['var(--font-display)'],
        mono:    ['var(--font-mono)'],
      },
      fontSize: {
        'mgr-h1':    ['28px', { lineHeight: '1.15', fontWeight: '700' }],
        'mgr-h2':    ['22px', { lineHeight: '1.2',  fontWeight: '700' }],
        'mgr-h3':    ['16px', { lineHeight: '1.3',  fontWeight: '600' }],
        'mgr-body':  ['14px', { lineHeight: '1.5',  fontWeight: '400' }],
        'mgr-small': ['12px', { lineHeight: '1.4',  fontWeight: '400' }],
        'mgr-xs':    ['11px', { lineHeight: '1.3',  fontWeight: '700' }],
      },
      letterSpacing: {
        caps:   '0.15em',
        capsXl: '0.18em',
      },
      boxShadow: {
        'sm':    '0 1px 2px rgba(27, 58, 92, .08)',
        'm':     '0 4px 16px rgba(27, 58, 92, .10)',
        'lg':    '0 12px 32px rgba(27, 58, 92, .14)',
      },
      transitionTimingFunction: {
        ease: 'cubic-bezier(.2, .6, .2, 1)',
      },
      keyframes: {
        'fade-in':  { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        'fade-in':  'fade-in 180ms cubic-bezier(.2,.6,.2,1)',
        'slide-up': 'slide-up 180ms cubic-bezier(.2,.6,.2,1)',
        'spin':     'spin 700ms linear infinite',
      },
    },
  },
  plugins: [],
}

export default maccionPreset
