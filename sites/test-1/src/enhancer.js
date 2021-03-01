// Local enhancer

const enhance = (
  fastify,
  subsiteRoot,
  siteSettings,
  globalSettings,
  globalServices,
  i18nm
) => {
  fastify.get('/', function (request, reply) {
    reply.send({ hello: 'world from overrided get handler in enhancer' })
  })
}

module.exports = enhance
