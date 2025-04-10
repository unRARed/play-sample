/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/views/**/*.{slim,erb,jbuilder,turbo_stream,js}',
    './app/helpers/**/*.rb',
    './app/assets/stylesheets/**/*.css',
    './app/assets/tailwind/**/*.css',
    './app/javascript/**/*.js'
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui")
  ],
  daisyui: {
    themes: ["sunset"],
    darkTheme: "sunset"
  }
}
