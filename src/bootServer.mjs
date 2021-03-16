import GracefulServer from '@gquittet/graceful-server'

import path from 'path'
import fastify from 'fastify'
import chalk from 'chalk'
import chokidar from 'chokidar'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

import {
  getDirectories,
  getSubsite,
  loadGlobalSettings,
  loadGlobalI18NMessages,
} from './utils.mjs'

import buildSubsitePlugin from './plugins/subsite.mjs'

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

  const { watch: globalWatch = [] } = settings || {}
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
    console.log(chalk.red(i18nm.error), i18nm.siteNotProvided)
    return
  }

  if (
    build &&
    buildTarget !== '*' &&
    !sites.find(site => site === buildTarget)
  ) {
    console.log(chalk.red(i18nm.error), i18nm.siteNotFound)
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
      level: isProduction ? 'error' : 'info',
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
      console.log(chalk.blue(i18nm.info), i18nm.finishedBuilding)
      duositeFastify && duositeFastify.close()
    }
    // else console.log(chalk.blue(i18nm.info),i18nm.serverReady)
  })

  gracefulServer.on(GracefulServer.SHUTTING_DOWN, () => {
    console.log(chalk.blue(i18nm.info), i18nm.serverShuttingDown)
    duositeFastify && duositeFastify.close()
  })

  gracefulServer.on(GracefulServer.SHUTDOWN, error => {
    if (error)
      console.log(chalk.blue(i18nm.info), i18nm.serverDownFor, error.message)
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

  let watcher
  if (mode === 'dev') {
    const watching = globalWatch

    watcher = chokidar.watch(watching, {
      persistent: true,

      ignoreInitial: false,
      followSymlinks: true,
      cwd: root,
      disableGlobbing: false,

      usePolling: false,
      interval: 100,
      binaryInterval: 300,
      alwaysStat: false,
      depth: 99,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100,
      },

      ignorePermissionErrors: false,
      atomic: true, // or a custom 'atomicity delay', in milliseconds (default 100)
    })

    let restarting = false
    console.log(chalk.blue(i18nm.info), i18nm.startWatcher)
    watcher.on('ready', function () {
      console.log(chalk.blue(i18nm.info), i18nm.startWatcherDone)

      watcher.on('change', function (path) {
        console.log(chalk.blue(i18nm.info), i18nm.restartDueTo)
        console.log(chalk.blue(i18nm.info), path)
        if (!restarting) {
          restarting = true
          duositeFastify.close().then(() => {
            require('child_process').spawn(process.argv.shift(), process.argv, {
              cwd: process.cwd(),
              stdio: 'inherit',
              detached: false,
            })
          })
        }
      })
    })
  }

  for (const site of sites) {
    duositeFastify.register(subsitePlugin, {
      prefix: site,
      _duosite: {
        mode,
        watcher,
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
      process.exit()
    }
    if (onStarted) {
      onStarted(duositeFastify)
    }
    gracefulServer.setReady()

    if (!build) console.log(chalk.blue(i18nm.info), i18nm.startMessage(port))
  })
}

export default bootServer
