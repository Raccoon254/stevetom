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
        },
        dark: {
          "primary": "#3b82f6",
          "secondary": "#10b981",
          "accent": "#8b5cf6",
        },
      },
    ],
  },
}

