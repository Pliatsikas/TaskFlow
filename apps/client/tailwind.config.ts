import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // CSS variable tokens — needed for globals.css @apply directives
        background:       "hsl(var(--background))",
        foreground:       "hsl(var(--foreground))",
        card:             "hsl(var(--card))",
        "card-foreground":"hsl(var(--card-foreground))",
        border:           "hsl(var(--border))",
        input:            "hsl(var(--input))",
        ring:             "hsl(var(--ring))",
        // Design tokens — change these to rebrand the whole app
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
        priority: {
          low:    "#22c55e",
          medium: "#f59e0b",
          high:   "#ef4444",
          urgent: "#7c3aed",
        },
      },
      borderRadius: {
        lg: "0.625rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
};

export default config;
