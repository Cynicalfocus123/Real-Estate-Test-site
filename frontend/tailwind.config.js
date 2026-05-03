/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#d40000",
          dark: "#171717",
          gray: "#4c4c4c",
          line: "#e8e1dc"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        search: "0 18px 50px rgba(23, 23, 23, 0.14)"
      }
    },
  },
  plugins: [],
};
