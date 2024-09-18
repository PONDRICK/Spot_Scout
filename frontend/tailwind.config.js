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
        
        primary: {"50":"#eff6ff","100":"#dbeafe","200":"#bfdbfe","300":"#93c5fd","400":"#60a5fa","500":"#3b82f6","600":"#2563eb","700":"#1d4ed8","800":"#1e40af","900":"#1e3a8a","950":"#172554"},
      }, 
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}