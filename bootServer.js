// requires

const GracefulServer = require('@gquittet/graceful-server')

const path = require('path')

const {
  getDirectories,
  getSubsite,
  loadGlobalSettings,
  loadGlobalI18NMessages,
} = require('./src/utils')
const chalk = require('chalk')

const requireOption = path => {
  try {
    return require(path)
  } catch (e) {
    console.log(e)
    return undefined
  }
}

const siteRootName = 'sites'

const root = process.env.DUOSITE_ROOT || process.cwd()

const isProduction = process.env.NODE_ENV === 'production'
/**
 * @param {function} onStarted - called this with fastify server
 */

const bootServer = onStarted => {
  // load global settings

  const settings = loadGlobalSettings(root)

  // const

  // root of user project

  // loading sites list and config

  const sites = getDirectories(path.join(root, siteRootName))

  // const load plugin

  const subsitePlugin = require('./src/plugins/subsite')

  const {
    defaultSite = 'www',
    lang = 'en',
    port = 5000,
    globalSettings = {},
  } = settings

  // load lang

  // i18n for messages
  const i18nm = loadGlobalI18NMessages(root, lang)

  // Build global services

  const buildGlobalServices = requireOption(`${root}/src/globalServices`)

  const globalServices = buildGlobalServices
    ? buildGlobalServices(settings, root)
    : {}

  // get global enhancer

  const enhance = requireOption(`${root}/src/enhancer`)

  // Get subsite list

  const fastify = requireOption('fastify')({
    logger: {
      level: isProduction ? 'error' : 'trace',
    },
    ...settings.fastify,
    rewriteUrl: function (req) {
      const subsite = getSubsite(req.headers.host, defaultSite)
      return subsite + req.url
    },
  })

  const gracefulServer = GracefulServer(fastify.server)

  gracefulServer.on(GracefulServer.READY, () => {
    console.log(i18nm.serverReady)
  })

  gracefulServer.on(GracefulServer.SHUTTING_DOWN, () => {
    console.log(i18nm.serverShuttingDown)
    fastify.close()
  })

  gracefulServer.on(GracefulServer.SHUTDOWN, error => {
    console.log(i18nm.serverDownFor, error.message)
    fastify.close()
  })

  enhance &&
    enhance(fastify, settings, {
      global: {
        root,
        settings: globalSettings,
        services: globalServices,
        i18nMessages: i18nm,
        lang,
      },
    })

  // boot subsite servers

  for (const site of sites) {
    fastify.register(subsitePlugin, {
      prefix: site,
      _duosite: {
        global: {
          root,
          settings: globalSettings,
          services: globalServices,
          i18nMessages: i18nm,
          lang,
        },
      },
    })
  }

  // Run the server!
  fastify.listen(port, function (err, address) {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
    if (onStarted) onStarted(fastify)
    gracefulServer.setReady()
    console.log(chalk.green(i18nm.startMessage(port)))
  })
}

module.exports = bootServer
