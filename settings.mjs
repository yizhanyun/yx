// shared settings
const settings = {
  defaultSite: 'www',
  // lang: 'zh-cn',
  port: 5000,
  fastify: {},
  sharedSettings: {
    // settings to be passed down to all subsites
    postgres: {
      user: 'demo_only',
    },
  },
}

export default settings
