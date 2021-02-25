// loading config

const deepmerge = require('deepmerge')

const sharedSetting = require('../settings') || {}
const byEnironmentSetting =
  process.env.NODE_ENV === 'production'
    ? require('../settings.production') || {}
    : require('../settings.development') || {}

const settings = deepmerge(sharedSetting, byEnironmentSetting)

const { defaultSite = 'www' } = settings

const fastify = require('fastify')({
  logger: true,
  rewriteUrl(req) {
    const subsite = req.headers.host.split('.')[1]

    if (!subsite) return '/' + defaultSite + req.url
    else return '/subsite' + req.url
  },
})

// Declare a route
fastify.get('/hello', function (request, reply) {
  reply.send({ hello: 'world...' })
})

// Declare a route
fastify.get('/www/hello', function (request, reply) {
  reply.send({ hello: 'world from www' })
})

// Declare a route
fastify.get('/r/hello', function (request, reply) {
  reply.send({ hello: 'world from /r/hello' })
})

// Run the server!
fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})
