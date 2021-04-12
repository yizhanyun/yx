import fs from 'fs-extra'
import GracefulServer from '@gquittet/graceful-server'
import deepmerge from 'deepmerge'
import path from 'path'
import fastify from 'fastify'
import chalk from 'chalk'
import chokidar from 'chokidar'
import { createRequire } from 'module'
import { pathToFileURL } from 'url'
// import fastifyProxy from 'fastify-http-proxy'
import fastifyProxy from 'fastify-reply-from'

import livereload from 'livereload'

const require = createRequire(import.meta.url)

import {
  getDirectories,
  getSubsite,
  breakFullpath,
  loadGlobalSettings,
  loadGlobalI18NMessages,
} from './utils.mjs'

import buildSubsitePlugin from './plugins/subsite.mjs'
import buildProxyPlugin from './plugins/proxy.mjs'

const siteRootName = 'sites'

/**
 * @param {Object} opts - options
 * @param {string} root - Project root
 * @param {function} onStarted - called this with fastify server when server started
 */

const bootServer = async opts => {
  // load global settings

  const { onStarted, root: _root, build, buildTarget, env, onBuildDone } =
    opts || {}

  const root = _root || process.env.YX_ROOT || process.cwd()

  const isProduction =
    env === 'production' || process.env.NODE_ENV === 'production'

  if (isProduction) process.env.NODE_ENV = 'production'

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
    host = 'localhost',
    port: _port = 5000,
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

  const port = build ? _port + 111 : _port

  // const load plugin

  const subsitePlugin = await buildSubsitePlugin(build, buildTarget)

  const proxyPlugin = await buildProxyPlugin(build, buildTarget)

  // Build global services

  let buildGlobalServices
  try {
    buildGlobalServices = (
      await import(pathToFileURL(path.join(root, 'src', 'globalServices.mjs')))
    ).default
  } catch (e) {
    // console.log(e)
  }

  const globalServices = buildGlobalServices
    ? await buildGlobalServices(settings, root)
    : {}

  // get global enhancer
  let enhance

  try {
    enhance = (
      await import(pathToFileURL(path.join(root, 'src', 'enhancer.mjs')))
    ).default
  } catch (e) {
    // console.log(e)
  }
  // Get subsite list

  const yxFastify = fastify({
    logger: {
      level: isProduction ? 'error' : 'info',
    },
    ...settings.fastify,
    rewriteUrl: function (req) {
      const _subsite = req.headers['x-yz-subdomain']
      if (_subsite) return _subsite + req.url

      const subsite = getSubsite(req.headers.host, defaultSite)
      return subsite + req.url
    },
  })

  const gracefulServer = GracefulServer(yxFastify.server)

  gracefulServer.on(GracefulServer.READY, () => {
    if (build) {
      console.log(chalk.blue(i18nm.info), i18nm.finishedBuilding)
      yxFastify && yxFastify.close()
      onBuildDone && onBuildDone()
    }
    // else console.log(chalk.blue(i18nm.info),i18nm.serverReady)
  })

  gracefulServer.on(GracefulServer.SHUTTING_DOWN, () => {
    console.log(chalk.blue(i18nm.info), i18nm.serverShuttingDown)
    yxFastify && yxFastify.close()
  })

  gracefulServer.on(GracefulServer.SHUTDOWN, error => {
    if (error)
      console.log(chalk.blue(i18nm.info), i18nm.serverDownFor, error.message)
    yxFastify && yxFastify.close()
  })

  enhance &&
    (await enhance(yxFastify, settings, {
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
      customBuildGlobal = await import(
        pathToFileURL(path.join(root, 'src', 'buildGlobal.mjs'))
      )
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
  const liveWatchFolders = []

  const extraExts = []

  for (const site of sites) {
    const siteRoot = path.join(
      root,
      siteRootName,
      site,
      mode === 'prod' ? '.production' : ''
    )

    // load subsite settings
    let sharedSetting, byEnironmentSetting
    try {
      sharedSetting = (
        await import(pathToFileURL(path.join(siteRoot, 'settings.mjs')))
      ).default
    } catch (e) {
      // console.log(e)
    }

    try {
      byEnironmentSetting =
        process.env.NODE_ENV === 'production'
          ? (
              await import(
                pathToFileURL(path.join(siteRoot, 'settings.production.mjs'))
              )
            ).default || {}
          : (
              await import(
                pathToFileURL(path.join(siteRoot, 'settings.development.mjs'))
              )
            ).default || {}
    } catch (e) {
      // console.log(e)
    }

    const settings = deepmerge(sharedSetting || {}, byEnironmentSetting || {})

    const { viewEngine = {} } = settings || {}

    const { proxyed, upstream, ext } = viewEngine

    liveWatchFolders.push(path.join(root, siteRootName, site, 'pages'))
    liveWatchFolders.push(path.join(root, siteRootName, site, 'public'))
    liveWatchFolders.push(path.join(root, siteRootName, site, 'src'))
    if (ext) extraExts.push(ext.replace('.', ''))

    if (proxyed) {
      yxFastify.register(fastifyProxy, {
        base: upstream,
        // prefix: site, // optional
        // http2: false, // optional
      })
      yxFastify.register(proxyPlugin, {
        prefix: site,
        siteSettings: settings,
        _yx: {
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
    } else {
      yxFastify.register(subsitePlugin, {
        prefix: site,
        siteSettings: settings,
        _yx: {
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
  }

  if (mode === 'dev') {
    // watch and restart

    // globalWatch.push(path.join(root, siteRootName))

    const watching = globalWatch

    const { livereload: reloadConfig } = settings
    let livereloadServer
    if (!reloadConfig || (reloadConfig && !reloadConfig.disabled)) {
      const port = 35729
      livereloadServer = livereload.createServer({ port, extraExts })
      livereloadServer.watch(liveWatchFolders)
    }

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
        let shouldRestart = false
        const srcStat = fs.statSync(path)
        if (srcStat.isDirectory()) shouldRestart = true
        else {
          const [_, filename] = breakFullpath(path)
          if (filename.startsWith('settings.')) shouldRestart = true
        }
        if (!restarting && shouldRestart) {
          restarting = true
          livereloadServer.close()
          yxFastify.close().then(() => {
            require('child_process').spawn(process.argv.shift(), process.argv, {
              cwd: process.cwd(),
              stdio: 'inherit',
              detached: false,
            })
          })
        } else {
          Object.keys(require.cache).forEach(function (id) {
            delete require.cache[id]
          })
        }
      })
    })
  }

  // Run the server!

  yxFastify.listen(port, host, function (err, address) {
    if (err) {
      yxFastify.log.error(err)
      process.exit()
    }
    if (onStarted) {
      onStarted(yxFastify)
    }
    gracefulServer.setReady()

    if (!build) console.log(chalk.blue(i18nm.info), i18nm.startMessage(port))
  })
}

export default bootServer
