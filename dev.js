const nodemon = require('nodemon')

let nodemonConfig = {}

const root = process.env.DUOSITE_ROOT || process.cwd()

console.log('root is === ', root)

try {
  nodemonConfig = require(`${root}/nodemon.json`)
  console.log('Use nodemon.json')
} catch (e) {
  nodemonConfig = require(`./nodemon.json`)
  console.log('No nodemon config file. Use default')
}

nodemon({
  ...nodemonConfig,
  script: './server.js',
})

nodemon
  .on('start', function () {
    console.log('App has started')
  })
  .on('quit', function () {
    console.log('App has quit')
  })
  .on('restart', function (files) {
    console.log('App restarted due to: ', files)
  })
