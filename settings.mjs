// shared settings
const settings = {
  defaultSite: 'www',
  lang: 'zh-cn',
  port: 5000,
  fastify: {},
  watch: ['src/**/*.mjs', 'sites/*/pages/**/*.mjs', '*.mjs'],
  sharedSettings: {
    // settings to be passed down to all subsites
    postgres: {
      user: 'demo_only',
    },
  },
  livereload: {
    disabled: false,
  },
}

export default settings
