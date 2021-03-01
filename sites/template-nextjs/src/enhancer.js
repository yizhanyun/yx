// Local enhancer

const enhance = (
  fastify,
  subsiteRoot,
  siteSettings,
  globalSettings,
  globalServices
) => {
  console.log('==> running nextjs local enhancer')
  fastify.register(require('fastify-nextjs')).after(() => {
    fastify.next('/hello')
  })
}

module.exports = enhance
