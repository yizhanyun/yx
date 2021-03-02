// shared settings
module.exports = {
  defaultSite: 'www',
  lang: 'en',
  port: 5000,
  globalSettings: {
    // settings to be passed down to all subsites
    postgres: {
      user: 'demo_only',
    },
  },
}
