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
    return undefined
  }
}

const siteRootName = 'sites'

const isProduction = process.env.NODE_ENV === 'production'
/**
 * @param {Object} opts - options
 * @param {string} root - Project root
 * @param {function} onStarted - called this with fastify server when server started
 */

const bootServer = async opts => {
  // load global settings

  const { onStarted, root: _root, env, build, buildTarget } = opts || {}

  if (env === 'production') process.env['NODE_ENV'] = 'production'

  const root = _root || process.env.DUOSITE_ROOT || process.cwd()

  const settings = loadGlobalSettings(root)

  // const

  // root of user project

  // loading sites list and config

  const sites = getDirectories(path.join(root, siteRootName))

  if (
    build &&
    buildTarget !== '*' &&
    !sites.find(site => site === buildTarget)
  ) {
    console.log('site not found')
    return
  }

  // const load plugin

  const buildSubsitePlugin = require('./src/plugins/subsite')
  const subsitePlugin = buildSubsitePlugin(build, buildTarget)

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
    console.log('Fastify started')
    if (build) {
      console.log('Finished building. Shutting down...')
      fastify && fastify.close()
    }
  })

  gracefulServer.on(GracefulServer.SHUTTING_DOWN, () => {
    console.log(i18nm.serverShuttingDown)
    fastify && fastify.close()
  })

  gracefulServer.on(GracefulServer.SHUTDOWN, error => {
    if (error) console.log(i18nm.serverDownFor, error.message)
    fastify && fastify.close()
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

  if (build) {
    let defaultBuildGlobal
    try {
      defaultBuildGlobal = require('./src/buildGlobal')
    } catch (e) {
      console.log(e)
    }

    let customBuildGlobal

    try {
      customBuildGlobal = require(path.join(root, 'src/buildGlobal'))
    } catch (e) {
      console.log(e)
    }

    const prebuild =
      (customBuildGlobal && customBuildGlobal.prebuild) ||
      (defaultBuildGlobal && defaultBuildGlobal.prebuild)

    prebuild && prebuild(root, settings, globalServices)

    const _build =
      (customBuildGlobal && customBuildGlobal.build) ||
      (defaultBuildGlobal && defaultBuildGlobal.build)

    _build && _build(root, settings, globalServices)

    const postbuild =
      (customBuildGlobal && customBuildGlobal.postbuild) ||
      (defaultBuildGlobal && defaultBuildGlobal.postbuild)

    postbuild && postbuild(root, settings, globalServices)
  }

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
    if (onStarted) {
      onStarted(fastify)
    }
    gracefulServer.setReady()
    console.log(chalk.green(i18nm.startMessage(port)))
  })
}

module.exports = bootServer
