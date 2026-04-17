/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: '#131320',
          hover: '#1e1e30',
          active: '#252538',
          text: '#9ca3af',
          heading: '#6b7280',
        },
        primary: '#111827',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
