// Local enhancer

const enhance = (fastify, _duosite) => {
  fastify.get('/', function (request, reply) {
    const { _duosite } = request

    reply.send({ hello: 'world from overrided get handler in enhancer' })
  })
}

export default enhance
