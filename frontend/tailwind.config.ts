import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        // Core backgrounds
        "bg-black": "hsl(var(--bg-black))",
        "bg-elev-1": "hsl(var(--bg-elev-1))",
        "bg-elev-2": "hsl(var(--bg-elev-2))",
        "stroke-line": "hsl(var(--stroke-line))",
        
        // Text colors
        "fg-primary": "hsl(var(--fg-primary))",
        "fg-secondary": "hsl(var(--fg-secondary))",
        "fg-muted": "hsl(var(--fg-muted))",
        
        // Brand colors (Solana Purple)
        brand: {
          50: "hsl(var(--brand-50))",
          100: "hsl(var(--brand-100))",
          200: "hsl(var(--brand-200))",
          300: "hsl(var(--brand-300))",
          400: "hsl(var(--brand-400))",
          500: "hsl(var(--brand-500))",
          600: "hsl(var(--brand-600))",
          700: "hsl(var(--brand-700))",
        },

        // Accent Orange
        orange: {
          50: "hsl(var(--accent-orange-50))",
          100: "hsl(var(--accent-orange-100))",
          400: "hsl(var(--accent-orange-400))",
          500: "hsl(var(--accent-orange-500))",
          600: "hsl(var(--accent-orange-600))",
        },

        // Solana Green
        solana: {
          400: "hsl(var(--accent-green-400))",
          500: "hsl(var(--accent-green-500))",
        },
        
        // Shadcn compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["Suisse Intl", "Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      fontSize: {
        "display-1": ["56px", { lineHeight: "64px", letterSpacing: "-0.01em" }],
        "display-2": ["44px", { lineHeight: "52px", letterSpacing: "-0.01em" }],
        "h1": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em" }],
        "h2": ["24px", { lineHeight: "32px" }],
        "h3": ["20px", { lineHeight: "28px" }],
        "body-1": ["16px", { lineHeight: "24px" }],
        "body-2": ["14px", { lineHeight: "20px" }],
        "micro": ["12px", { lineHeight: "16px" }],
      },
      fontWeight: {
        medium: "500",
        semibold: "600",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        orbit: {
          "0%": {
            transform: "rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)",
          },
        },
        shimmer: {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(100%)",
          },
        },
        "gradient-pan": {
          "0%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
          "100%": {
            backgroundPosition: "0% 50%",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        orbit: "orbit calc(var(--duration)*1s) linear infinite",
        shimmer: "shimmer 2s ease-in-out infinite",
        "gradient-pan": "gradient-pan 5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
