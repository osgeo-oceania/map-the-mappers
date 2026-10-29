import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    // Scan lib/ so classes in shared control helpers are generated.
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-ibm-plex-serif)', 'serif'],
        sans: ['var(--font-plus-jakarta-sans)', 'sans-serif'],
        button: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        brand: {
          primary: '#60A955',
          secondary: '#183138',
        },
        accentColors: {
          fern: '#3E7E54',
          mint: '#8CDCB5',
          lime: '#D6F599',
          coral: '#F47C57',
          skyBlue: '#9CD5DD',
          lilac: '#E7E2F3',
        },
        success: '#4EA497',
        error: '#E04A39',
        neutral: {
          charcoal: '#1B1B1B',
          warmGrey: '#D8D8D4',
          offWhite: '#F9F8F6',
          cardSurface: '#F1F1F1',
        },
        osgeo: {
          inputFieldGrey: '#F3F3F3',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        standard: '12px',
      },
      // Extend spacing with new keys; overriding defaults changes icon sizes.
      maxWidth: {
        container: '1200px',
      },
      boxShadow: {
        elevation:
          '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
