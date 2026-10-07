/** Warna & font mengikuti desain Figma (EduPlatform). Ubah di sini untuk mengganti tema. */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#7c5cfc", dark: "#6847f0" },
        sidebar: { DEFAULT: "#1d1536", active: "#3a2a63" },
        night: "#1a1030",
        plum: "#3d2b66",
        canvas: "#f5f3ff",
        sand: "#ede6d8",
        ember: "#d9772b",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
