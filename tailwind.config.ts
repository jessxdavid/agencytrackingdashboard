import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // SHARRIFF-style semantic tokens (HSL via CSS vars)
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "surface-1": "hsl(var(--surface-1))",
        "surface-2": "hsl(var(--surface-2))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        "border-strong": "hsl(var(--border-strong))",
        input: "hsl(var(--input))",
        brand: "hsl(var(--brand))",
        "brand-foreground": "hsl(var(--brand-foreground))",
        "brand-soft": "hsl(var(--brand-soft))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        info: "hsl(var(--info))",

        // Legacy bg/line/ink (still used by Pipeline kanban colors)
        bg: {
          DEFAULT: "#0a0a0c",
          elevated: "#0f0f12",
          card: "#15151a",
          hover: "#1c1c22",
          input: "#1f1f25",
        },
        line: "#26262d",
        ink: {
          DEFAULT: "#FAFAFA",
          dim: "#A1A1A8",
          subtle: "#6B6B72",
        },

        // Stage tints — used by Pipeline kanban
        stage: {
          outbound: { bg: "#3A1F1A", fg: "#E5947D", chip: "#5C2E22" },
          inbound: { bg: "#1A2C3A", fg: "#7DBFE5", chip: "#22425C" },
          rapport: { bg: "#1A3A36", fg: "#7DE5D5", chip: "#22524A" },
          discovery: { bg: "#1F3A1A", fg: "#9DE57D", chip: "#2E5C22" },
          problem: { bg: "#2F1A3A", fg: "#C77DE5", chip: "#3F225C" },
          proposed: { bg: "#3A2F1A", fg: "#E5C77D", chip: "#5C422E" },
          follow: { bg: "#3A1A2F", fg: "#E57DBA", chip: "#5C2247" },
          booked: { bg: "#1A3A23", fg: "#7DE594", chip: "#225C36" },
          closed: { bg: "#0F2A18", fg: "#5BC97A", chip: "#1B4429" },
          broke: { bg: "#2A2A2A", fg: "#9B9B9B", chip: "#3A3A3A" },
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Inter", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
      },
      backgroundImage: {
        "grid":
          "linear-gradient(hsl(var(--border)/0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)/0.5) 1px, transparent 1px)",
        "grid-fade":
          "radial-gradient(ellipse at top, transparent 30%, hsl(var(--background)) 70%)",
      },
      backgroundSize: {
        grid: "32px 32px",
      },
      boxShadow: {
        subtle: "0 1px 0 hsl(var(--border)/0.5), 0 0 0 1px hsl(var(--border)/0.1)",
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
