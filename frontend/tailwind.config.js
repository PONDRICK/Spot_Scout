/** @type {import('tailwindcss').Config} */

module.exports = {
  purge: [
    './src/**/*.{html,ts}',
  ],
  darkMode: false, 
  theme: {
    extend: {
      colors: {
        "custom-blue": "#1E40AF",
        "text-red-500": "#E1341E",
        "text-green-500": "#63cf30",
        "ring-blue-500": "##F40B59",
        "text-gray-700": "#888888",
        "border-gray-300": "#575757",
        "bg-blue-600":"#7676D3",
        "text-white":"#F9F9F9",
        "bg-blue-500":"#4156BE",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}