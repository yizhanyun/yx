// Local enhancer

const enhance = (fastify, _yx) => {
  fastify.get('/', function (request, reply) {
    const { _yx } = request

    reply.send({ hello: 'world from overrided get handler in enhancer' })
  })
}

export default enhance
