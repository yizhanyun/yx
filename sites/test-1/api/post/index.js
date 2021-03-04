const route = {
  method: 'GET',
  handler: function (request, reply) {
    reply.send({ ids: ['11', '22'] })
  },
}

module.exports = route
