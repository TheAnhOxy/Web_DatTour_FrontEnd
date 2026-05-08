/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5",
        secondary: "#6366f1",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        dark: "#0f172a",
        light: "#f8fafc",
      },

      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.1)",
        card: "0 2px 12px rgba(0,0,0,0.08)",
      },

      borderRadius: {
        xl2: "1.25rem",
      },

      spacing: {
        128: "32rem",
        144: "36rem",
      },

      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
      },
    },
  },
  plugins: [],
};
