import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        floatAndBreathe: {
          "0%, 100%": {
            transform: "translateY(0px) scale(1)",
            filter: "drop-shadow(0 15px 20px rgba(0, 0, 0, 0.25))",
          },
          "50%": {
            transform: "translateY(-14px) scale(1.02)",
            filter: "drop-shadow(0 28px 30px rgba(0, 0, 0, 0.15))",
          },
        },
        fadeSlideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        iconPop: {
          "0%": { transform: "scale(0.6) rotate(-15deg)", opacity: "0" },
          "60%": { transform: "scale(1.15) rotate(8deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
      },
      animation: {
        floatAndBreathe: "floatAndBreathe 4.5s ease-in-out infinite",
        fadeSlideUp: "fadeSlideUp 0.5s ease-out",
        iconPop: "iconPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
}
export default config
