/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'rgb(var(--color-border))', /* slate-200 */
        input: 'rgb(var(--color-input))', /* slate-200 */
        ring: 'rgb(var(--color-ring))', /* red-500 */
        background: 'rgb(var(--color-background))', /* white */
        foreground: 'rgb(var(--color-foreground))', /* gray-800 */
        primary: {
          DEFAULT: 'rgb(var(--color-primary))', /* red-500 - vibrant coral */
          foreground: 'rgb(var(--color-primary-foreground))', /* white */
        },
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary))', /* teal-500 - fresh teal */
          foreground: 'rgb(var(--color-secondary-foreground))', /* white */
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent))', /* purple-500 - vibrant purple */
          foreground: 'rgb(var(--color-accent-foreground))', /* white */
        },
        muted: {
          DEFAULT: 'rgb(var(--color-muted))', /* slate-50 */
          foreground: 'rgb(var(--color-muted-foreground))', /* slate-500 */
        },
        card: {
          DEFAULT: 'rgb(var(--color-card))', /* white */
          foreground: 'rgb(var(--color-card-foreground))', /* gray-800 */
        },
        popover: {
          DEFAULT: 'rgb(var(--color-popover))', /* white */
          foreground: 'rgb(var(--color-popover-foreground))', /* gray-800 */
        },
        success: {
          DEFAULT: 'rgb(var(--color-success))', /* green-600 */
          foreground: 'rgb(var(--color-success-foreground))', /* white */
        },
        warning: {
          DEFAULT: 'rgb(var(--color-warning))', /* yellow-500 */
          foreground: 'rgb(var(--color-warning-foreground))', /* gray-800 */
        },
        error: {
          DEFAULT: 'rgb(var(--color-error))', /* red-600 */
          foreground: 'rgb(var(--color-error-foreground))', /* white */
        },
        destructive: {
          DEFAULT: 'rgb(var(--color-destructive))', /* red-600 */
          foreground: 'rgb(var(--color-destructive-foreground))', /* white */
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-vibrant': 'linear-gradient(135deg, #ef4444 0%, #ec4899 50%, #a855f7 100%)',
        'gradient-fresh': 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 50%, #3b82f6 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #ec4899 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.75rem', /* 12px - modern, friendly */
      },
      maxWidth: {
        container: '1280px', /* max-w-7xl */
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          from: {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
}