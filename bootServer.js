// requires

const GracefulServer = require('@gquittet/graceful-server')
const deepmerge = require('deepmerge')

const path = require('path')
const { getDirectories, getSubsite } = require('./src/utils')
const chalk = require('chalk')

const requireOption = path => {
  try {
    return require(path)
  } catch (e) {
    return undefined
  }
}

const bootServer = () => {
  // const

  const siteRootName = 'sites'

  // root of user project
  const root = process.env.DUOSITE_ROOT || process.cwd()

  // loading sites list and config

  const sites = getDirectories(path.join(root, siteRootName))

  // const load plugin

  const subsitePlugin = require('./src/plugins/subsite')

  // load global settings

  const sharedSetting = requireOption(path.join(root, 'settings')) || {}
  const byEnironmentSetting =
    process.env.NODE_ENV === 'production'
      ? requireOption(path.join(root, 'settings.production')) || {}
      : requireOption(path.join(root, 'settings.development')) || {}

  const settings = deepmerge(sharedSetting, byEnironmentSetting)

  const { defaultSite = 'www', lang = 'zh-cn', port = 5000 } = settings

  // load lang

  const i18n = requireOption(`./src/lang/${lang}`)

  // load engine getter

  // Get subsite list

  const fastify = requireOption('fastify')({
    logger: { level: 'trace' },
    rewriteUrl: function (req) {
      const subsite = getSubsite(req.headers.host, defaultSite)
      return subsite + req.url
    },
  })

  const gracefulServer = GracefulServer(fastify.server)

  gracefulServer.on(GracefulServer.READY, () => {
    console.log('Server is ready')
  })

  gracefulServer.on(GracefulServer.SHUTTING_DOWN, () => {
    console.log('Server is shutting down')
  })

  gracefulServer.on(GracefulServer.SHUTDOWN, error => {
    console.log('Server is down because of', error.message)
  })

  for (const site of sites) {
    fastify.register(subsitePlugin, {
      prefix: site,
      _duosite: {
        siteRoot: path.join(root, siteRootName, site),
      },
    })
  }

  // Run the server!
  fastify.listen(port, function (err, address) {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
    gracefulServer.setReady()
    console.log(chalk.green(i18n.startMessage(port)))
  })
}

module.exports = bootServer
