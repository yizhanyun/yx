// shared settings
export default {
  watch: ['pages/**/*.liquid', 'pages/**/*.boot.mjs'],
  viewEngine: {
    name: 'liquid',
    ext: '.liquid', // template extension
    options: {
      // options to be passed to view engine
    },
  },
}
