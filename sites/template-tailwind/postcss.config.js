// postcss.config.js
const path = require('path')

const isProduction = process.env.NODE_ENV === 'production'

const tailwindConfigFile = isProduction
  ? 'tailwind.config.prod.js'
  : 'tailwind.config.js'

const tailwindConfig = path.join(__dirname, tailwindConfigFile)

module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss')(tailwindConfig),
    require('autoprefixer'),
  ],
}
