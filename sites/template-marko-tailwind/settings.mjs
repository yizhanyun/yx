// shared settings
export default {
  watch: [
    'pages/**/*.marko',
    'pages/**/*.boot.mjs',
    'components/**/*.marko',
    'components/**/*.boot.mjs',
  ],
  viewEngine: {
    name: 'marko',
    ext: '.marko', // template extension
    options: {
      // options to be passed to view engine
    },
  },
}
