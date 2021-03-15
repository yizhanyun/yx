import path from 'path'

import nodemon from 'nodemon'
import chalk from 'chalk'

import chokidar from 'chokidar'

import { readFile } from 'fs/promises'

import { loadGlobalSettings, loadGlobalI18NMessages } from './utils.mjs'

let nodemonConfig = {}

const root = process.env.DUOSITE_ROOT || process.cwd()

const dev = async () => {
  const globalSettings = await loadGlobalSettings(root)

  const i18nm = await loadGlobalI18NMessages(root, globalSettings.lang)

  const watching = [
    'src/**/*.mjs',
    'sites/pages/**/*.mjs',
    'sites/pages/**/*.marko',
  ]

  const watcher = chokidar.watch(watching, {
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
  watcher.on('ready', function () {
    watcher.on('all', function () {
      Object.keys(require.cache).forEach(function (id) {
        delete require.cache[id]
      })
    })
  })
}

export default dev
