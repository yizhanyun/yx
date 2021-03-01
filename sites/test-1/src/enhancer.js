// Local enhancer

const enhance = (
  fastify,
  subsiteRoot,
  siteSettings,
  globalSettings,
  globalServices
) => {
  console.log('==> running local enhancer')
  fastify.get('/', function (request, reply) {
    reply.send({ hello: 'world from overrided get handler in enhancer' })
  })
}

module.exports = enhance
