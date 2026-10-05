/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ios: {
          bg: "#0f1015",
          surface: "#16171d",
          elevated: "#1e2028",
          border: "#262832",
          subtle: "#2c2e3a",
          green: "#30d158",
          red: "#ff453a",
          yellow: "#ffd60a",
          blue: "#0a84ff",
          text: "#f2f2f7",
          secondary: "#8e8e93",
          tertiary: "#636366",
        }
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'SF Pro Display'",
          "'SF Pro Text'",
          "system-ui",
          "sans-serif"
        ]
      }
    },
  },
  plugins: [],
}
