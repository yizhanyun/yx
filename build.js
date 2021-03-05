const path = require('path')

const bootServer = require('./bootServer')

const target = process.argv[2] === 'all' ? '*' : process.argv[2]

bootServer({ build: true, env: 'production', buildTarget: target })
