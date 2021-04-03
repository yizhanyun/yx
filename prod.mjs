import bootServer from './src/bootServer.mjs'

if (process.env.NODE_ENV !== 'production') {
  throw new Error('Must set NODE_ENV to production')
}

const root = process.env.YX_ROOT || process.cwd()

bootServer({ root })
