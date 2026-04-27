import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        success: "#10b981", // Green
        warning: "#f59e0b", // Yellow
        danger: "#ef4444", // Red
      },
      backgroundImage: {
        'red-stripes': 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(239, 68, 68, 0.4) 10px, rgba(239, 68, 68, 0.4) 20px)',
      }
    },
  },
  plugins: [],
};
export default config;
