const enhance = async (fastify, _yx) => {
  const {
    site: { services },
  } = _yx
  fastify.route({
    method: 'GET',
    url: '/add/salt/:food',
    handler: function (request, reply) {
      const { food } = request.params
      const salted = services.addSalt(food)
      reply.send({ hello: 'world,I am enhanced', salted })
    },
  })
}

export default enhance
