import GracefulServer from '@gquittet/graceful-server'

import path from 'path'
import fastify from 'fastify'

import {
  getDirectories,
  getSubsite,
  loadGlobalSettings,
  loadGlobalI18NMessages,
} from './src/utils.mjs'

import buildSubsitePlugin from './src/plugins/subsite.mjs'

import chalk from 'chalk'

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

  const settings = await loadGlobalSettings(root)

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


  const subsitePlugin = await buildSubsitePlugin(build, buildTarget)

  const {
    defaultSite = 'www',
    lang = 'en',
    port = 5000,
    globalSettings = {},
  } = settings

  // load lang

  // i18n for messages
  const i18nm = await loadGlobalI18NMessages(root, lang)

  // Build global services

  let buildGlobalServices
  try {
    buildGlobalServices = (await import(`${root}/src/globalServices.mjs`)).default
  } catch {}

  const globalServices = await buildGlobalServices
    ? buildGlobalServices(settings, root)
    : {}

  // get global enhancer
  let enhance

  try {
    enhance = (await import(`${root}/src/enhancer.mjs`)).default
  } catch (e) {}
  // Get subsite list

  const duositeFastify = fastify({
    logger: {
      level: isProduction ? 'error' : 'trace',
    },
    ...settings.fastify,
    rewriteUrl: function (req) {
      const subsite = getSubsite(req.headers.host, defaultSite)
      return subsite + req.url
    },
  })

  const gracefulServer = GracefulServer(duositeFastify.server)

  gracefulServer.on(GracefulServer.READY, () => {
    console.log(i18nm.serverReady)
    console.log('Fastify started')
    if (build) {
      console.log('Finished building. Shutting down...')
      duositeFastify && duositeFastify.close()
    }
  })

  gracefulServer.on(GracefulServer.SHUTTING_DOWN, () => {
    console.log(i18nm.serverShuttingDown)
    duositeFastify && duositeFastify.close()
  })

  gracefulServer.on(GracefulServer.SHUTDOWN, error => {
    if (error) console.log(i18nm.serverDownFor, error.message)
    duositeFastify && duositeFastify.close()
  })

  enhance &&
    await enhance(duositeFastify, settings, {
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
      defaultBuildGlobal = (await import('./src/buildGlobal.mjs')).default
    } catch (e) {
      console.log(e)
    }

    let customBuildGlobal

    try {
      customBuildGlobal = (await import(path.join(root, 'src/buildGlobal.mjs'))).default
    } catch (e) {
      console.log(e)
    }

    const prebuild =
      (customBuildGlobal && customBuildGlobal.prebuild) ||
      (defaultBuildGlobal && defaultBuildGlobal.prebuild)

    prebuild && await prebuild(root, settings, globalServices)

    const _build =
      (customBuildGlobal && customBuildGlobal.build) ||
      (defaultBuildGlobal && defaultBuildGlobal.build)

    _build && await _build(root, settings, globalServices)

    const postbuild =
      (customBuildGlobal && customBuildGlobal.postbuild) ||
      (defaultBuildGlobal && defaultBuildGlobal.postbuild)

    postbuild && await postbuild(root, settings, globalServices)
  }

  // boot subsite servers

  for (const site of sites) {
    duositeFastify.register(subsitePlugin, {
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

  duositeFastify.listen(port, function (err, address) {
    if (err) {
      duositeFastify.log.error(err)
      process.exit(1)
    }
    if (onStarted) {
      onStarted(duositeFastify)
    }
    gracefulServer.setReady()
    console.log(chalk.green(i18nm.startMessage(port)))
  })
}

export default bootServer
