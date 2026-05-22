/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg:       "var(--color-bg)",
        surface:  "var(--color-surface)",
        muted:    "var(--color-muted)",
        border:   "var(--color-border)",
        text:     "var(--color-text)",
        subtext:  "var(--color-subtext)",
        primary:  "var(--color-primary)",
        success:  "var(--color-success)",
        danger:   "var(--color-danger)",
      },
    },
  },
  plugins: [],
};
