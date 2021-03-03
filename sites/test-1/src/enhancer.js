// Local enhancer

const enhance = (fastify, _duosite) => {
  fastify.get('/', function (request, reply) {
    const { _duosite } = request

    console.log('>>>>> site enhancer', _duosite)
    reply.send({ hello: 'world from overrided get handler in enhancer' })
  })
}

module.exports = enhance
