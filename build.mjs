import bootServer from './src/bootServer.mjs'

const target = process.argv[2] === 'all' ? '*' : process.argv[2]

bootServer({ build: true, env: 'production', buildTarget: target })
