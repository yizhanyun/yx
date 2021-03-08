const enhance = async (fastify, _duosite) => {
  const {
    site: { services },
  } = _duosite
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
