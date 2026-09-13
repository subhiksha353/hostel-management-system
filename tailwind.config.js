/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          50: '#f0f5ff',
          100: '#e0edff',
          200: '#c7dcff',
          300: '#9ec2ff',
          400: '#699dfb',
          500: '#3b78f6',
          600: '#255beb',
          700: '#1d46d8',
          800: '#1e3ab8',
          900: '#1e3492',
          950: '#0f1c4d',
        },
        navy: {
          800: '#0f172a',
          850: '#0b1120',
          900: '#0a0e1a',
          950: '#060911',
        },
        privacy: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        accent: {
          purple: '#8b5cf6',
          cyan: '#06b6d4',
          amber: '#f59e0b',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 25px -5px rgba(59, 130, 246, 0.25)',
        'glow-critical': '0 0 25px -5px rgba(239, 68, 68, 0.35)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
