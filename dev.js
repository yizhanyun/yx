const path = require('path')

let nodemon = require('nodemon')

const bootServer = require('./bootServer')

let nodemonConfig = {}

const root = process.env.DUOSITE_ROOT || process.cwd()

try {
  nodemonConfig = require(`${root}/nodemon.json`)
  console.log('Use nodemon.json')
} catch (e) {
  nodemonConfig = require('./nodemon.json')
  console.log('No nodemon config file. Use default')
}

const { watch } = nodemonConfig

const watchWithRoot = watch.map(p => path.join(root, p))

nodemon({
  ...nodemonConfig,
  watch: watchWithRoot,
  script: './server.js',
})
console.log('===', nodemonConfig, watchWithRoot)

nodemon
  .on('start', function () {
    console.log('Nodemon: App has started')
  })
  .on('quit', function () {
    console.log('Nodemon: App has quit')
    nodemon = null
  })
  .on('restart', function (files) {
    console.log('Nodemon: App restarted due to: ', files)
  })
