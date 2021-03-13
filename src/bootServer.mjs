import GracefulServer from '@gquittet/graceful-server'

import path from 'path'
import fastify from 'fastify'

import {
  getDirectories,
  getSubsite,
  loadGlobalSettings,
  loadGlobalI18NMessages,
} from './utils.mjs'

import buildSubsitePlugin from './plugins/subsite.mjs'

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

  const { onStarted, root: _root, build, buildTarget } = opts || {}

  const root = _root || process.env.DUOSITE_ROOT || process.cwd()

  const mode = build ? 'build' : isProduction ? 'prod' : 'dev'

  const settings = await loadGlobalSettings(root)

  // const

  // root of user project

  // loading sites list and config

  const sites = getDirectories(path.join(root, siteRootName))

  const {
    defaultSite = 'www',
    lang = 'en',
    port = 5000,
    globalSettings = {},
  } = settings

  // load lang

  // i18n for messages
  const i18nm = await loadGlobalI18NMessages(root, lang)

  if (build && !buildTarget) {
    console.log(chalk.red(i18nm.siteNotProvided))
    return
  }

  if (
    build &&
    buildTarget !== '*' &&
    !sites.find(site => site === buildTarget)
  ) {
    console.log(chalk.red(i18nm.siteNotFound))
    return
  }

  // const load plugin

  const subsitePlugin = await buildSubsitePlugin(build, buildTarget)

  // Build global services

  let buildGlobalServices
  try {
    buildGlobalServices = (await import(`${root}/src/globalServices.mjs`))
      .default
  } catch (e) {}

  const globalServices = buildGlobalServices
    ? await buildGlobalServices(settings, root)
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
    if (build) {
      console.log('Finished building. Shutting down...')
      duositeFastify && duositeFastify.close()
    } else console.log(i18nm.serverReady)
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
    (await enhance(duositeFastify, settings, {
      global: {
        root,
        settings: globalSettings,
        services: globalServices,
        i18nMessages: i18nm,
        lang,
      },
    }))

  if (build) {
    let defaultBuildGlobal
    try {
      defaultBuildGlobal = await import('./src/buildGlobal.mjs')
    } catch (e) {
      // console.log(e)
    }

    let customBuildGlobal

    try {
      customBuildGlobal = await import(path.join(root, 'src/buildGlobal.mjs'))
    } catch (e) {
      // console.log(e)
    }

    const prebuild =
      (customBuildGlobal && customBuildGlobal.prebuild) ||
      (defaultBuildGlobal && defaultBuildGlobal.prebuild)

    prebuild && (await prebuild(root, settings, globalServices))

    const _build =
      (customBuildGlobal && customBuildGlobal.build) ||
      (defaultBuildGlobal && defaultBuildGlobal.build)

    _build && (await _build(root, settings, globalServices))

    const postbuild =
      (customBuildGlobal && customBuildGlobal.postbuild) ||
      (defaultBuildGlobal && defaultBuildGlobal.postbuild)

    postbuild && (await postbuild(root, settings, globalServices))
  }

  // boot subsite servers

  for (const site of sites) {
    duositeFastify.register(subsitePlugin, {
      prefix: site,
      _duosite: {
        mode,
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
    if (!build) console.log(chalk.green(i18nm.startMessage(port)))
  })
}

export default bootServer
