/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#111111",
          800: "#2d2d2d",
          600: "#666666",
        },
        line: "#dedbd4",
        paper: "#f8f6f1",
        accent: "#2f6f5e",
      },
      boxShadow: {
        soft: "0 12px 35px rgb(17 17 17 / 0.08)",
      },
    },
  },
  plugins: [],
};
