// tailwind.config.js
const path = require('path')
const src = path.join(__dirname)

module.exports = {
  purge: [`pages/**/*.html`], // or other files for tail wind production build
  future: {},
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
}
