/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
   theme: {
    extend: {
      colors: {
        qrz: {
          navy: "#052346",
          blue: "#01BBE6",
          light: "#EAF9FD",
          gray: "#64748B",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
