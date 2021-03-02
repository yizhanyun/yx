const path = require('path')

let nodemon = require('nodemon')

const bootServer = require('./bootServer')

const { loadGlobalSettings, loadGlobalI18NMessages } = require('./src/utils')

let nodemonConfig = {}

const root = process.env.DUOSITE_ROOT || process.cwd()

const globalSettings = loadGlobalSettings(root)

const i18nm = loadGlobalI18NMessages(root, globalSettings.lang)

try {
  nodemonConfig = require(`${root}/nodemon.json`)
  console.log(i18nm.useCustomNodemonJson)
} catch (e) {
  nodemonConfig = require('./nodemon.json')
  console.log(i18nm.useDefaultJson)
}

const { watch } = nodemonConfig

const watchWithRoot = watch.map(p => path.join(root, p))

nodemon({
  ...nodemonConfig,
  watch: watchWithRoot,
  script: './server.js',
})

nodemon
  .on('start', function () {
    console.log(i18nm.nodemonStarted)
  })
  .on('quit', function () {
    console.log(i18nm.nodemonQuit)
    nodemon = null
  })
  .on('restart', function (files) {
    console.log(i18nm.nodemonRestart, files)
  })
