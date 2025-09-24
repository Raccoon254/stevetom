/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#10b981',
        accent: '#8b5cf6',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#3b82f6",
          "secondary": "#10b981",
          "accent": "#8b5cf6",
          "base-100": "#ffffff",
          "base-200": "#f3f4f6",
          "base-300": "#e5e7eb",
        },
        dark: {
          "primary": "#3b82f6",
          "secondary": "#10b981",
          "accent": "#8b5cf6",
          "base-100": "#000000e6",
          "base-200": "#000000cc",
          "base-300": "#000000b3",
        },
      },
    ],
  },
}

