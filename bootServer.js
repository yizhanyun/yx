// requires

const GracefulServer = require('@gquittet/graceful-server')
const deepmerge = require('deepmerge')

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
    return undefined
  }
}

const siteRootName = 'sites'

const root = process.env.DUOSITE_ROOT || process.cwd()

/**
 * @param {function} onStarted - called this with fastify server
 */

const bootServer = onStarted => {
  // const

  // root of user project

  // loading sites list and config

  const sites = getDirectories(path.join(root, siteRootName))

  // const load plugin

  const subsitePlugin = require('./src/plugins/subsite')

  // load global settings

  const settings = loadGlobalSettings(root) //deepmerge(sharedSetting, byEnironmentSetting)

  const {
    defaultSite = 'www',
    lang = 'zh-cn',
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

  // run global enhancer

  const enhance = requireOption(`${root}/src/enhancer`)

  enhance && enhance(fastify, { root, settings, globalServices, i18nm, lang })

  // boot subsite servers

  for (const site of sites) {
    const i18nSiteHandlers = requireOption(
      path.join(
        root,
        siteRootName,
        site,
        'src',
        'lang',
        'handlers',
        `${lang}.js`
      )
    )
    fastify.register(subsitePlugin, {
      prefix: site,
      _duosite: {
        siteRoot: path.join(root, siteRootName, site),
        globalSettings,
        globalServices,
        i18nMessages: i18nm,
        i18nSiteHandlers,
        site,
        lang,
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
