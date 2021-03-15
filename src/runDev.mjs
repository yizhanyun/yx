import bootServer from './bootServer.mjs'

import chokidar from 'chokidar'

import { loadGlobalSettings } from './utils.mjs'

const root = process.env.DUOSITE_ROOT || process.cwd()
const dev = async () => {
  const globalSettings = await loadGlobalSettings(root)
  const watcher = chokidar.watch(globalSettings.watch || [], {
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
  bootServer({ watcher })
}

export default dev
