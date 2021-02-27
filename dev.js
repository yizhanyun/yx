const nodemon = require('nodemon')

let nodemonConfig = {
  ignore: ['.git', '.cache', '.yarn', 'node_modules/**/node_modules'],
  verbose: true,
  env: {
    NODE_ENV: 'development',
  },
  watch: [
    'sites/',
    'src/',
    'server.js',
    'settings.js',
    'settings.development.js',
    'setting.production.js',
  ],
  ext: 'js, html, marko, css, boot.js',
}

try {
  nodemonConfig = require('./nodemon.json')
  console.log('Use nodemon.json')
} catch (e) {
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
