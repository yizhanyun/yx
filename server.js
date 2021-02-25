// requires

const deepmerge = require('deepmerge')

const path = require('path')

const fastifyStatic = require('fastify-static')

const { getDirectories } = require('./src/utils')

// consts

const sitesRoot = 'sites'
const staticRoot = 'static'

// loading sites list and config

const sites = getDirectories(path.join(__dirname, sitesRoot))

// load global settings

const sharedSetting = require('./settings') || {}
const byEnironmentSetting =
  process.env.NODE_ENV === 'production'
    ? require('./settings.production') || {}
    : require('./settings.development') || {}

const settings = deepmerge(sharedSetting, byEnironmentSetting)

const { defaultSite = 'www' } = settings

// Get subsite list

const fastify = require('fastify')({
  logger: true,
  rewriteUrl(req) {
    const subsite = req.headers.host.split('.')[0]
    if (!subsite) return '/' + defaultSite + req.url
    else return '/' + subsite + req.url
  },
})

// Register static file handlers

for (const site of sites) {
  console.log(site)
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, sitesRoot, site, staticRoot),
    prefix: `/${site}/${staticRoot}`,
    decorateReply: false, // the reply decorator has been added by the first plugin registration
  })
}

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
