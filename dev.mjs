import path from 'path'

import nodemon from 'nodemon'

import { readFile } from 'fs/promises'

import { loadGlobalSettings, loadGlobalI18NMessages } from './src/utils.mjs'

let nodemonConfig = {}

const root = process.env.DUOSITE_ROOT || process.cwd()

const globalSettings = await loadGlobalSettings(root)

const i18nm = await loadGlobalI18NMessages(root, globalSettings.lang)

try {
  nodemonConfig = JSON.parse(
    await readFile(new URL(`${root}/nodemon.json`, import.meta.url))
  )

  console.log(i18nm.useCustomNodemonJson)
} catch (e) {
  nodemonConfig = JSON.parse(
    await readFile(new URL('./nodemon.json', import.meta.url))
  )

  console.log(i18nm.useDefaultNodemonJson)
}

const { watch } = nodemonConfig

const watchWithRoot = watch.map(p => path.join(root, p))

nodemon({
  ...nodemonConfig,
  watch: watchWithRoot,
  script: './src/runDev.mjs',
})

nodemon
  .on('start', function () {
    console.log(i18nm.nodemonStarted)
  })
  .on('quit', function () {
    console.log(i18nm.nodemonQuit)
  })
  .on('restart', function (files) {
    console.log(i18nm.nodemonRestart, files)
  })
