const path = require('path')

const { loadGlobalSettings, loadGlobalI18NMessages } = require('./src/utils')

if (process.env.NODE_ENV !== 'production')
  throw new Error('Must set NODE_ENV to production')

const root = process.env.DUOSITE_ROOT || process.cwd()

const globalSettings = loadGlobalSettings(root)

const i18nm = loadGlobalI18NMessages(root, globalSettings.lang)

const bootServer = require('./bootServer')
bootServer({ root })
