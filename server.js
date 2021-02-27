// requires

const deepmerge = require('deepmerge')

const path = require('path')

const { getDirectories, getSubsite } = require('./src/utils')

const chalk = require('chalk')

// consts

const siteRootName = 'sites'

// root of user project
const root = process.cwd()

const requireOption = path => {
  try {
    return require(path)
  } catch (e) {
    return undefined
  }
}

// loading sites list and config

const sites = getDirectories(path.join(root, siteRootName))

// const load plugin

const subsitePlugin = require('./src/plugins/subsite')

// load global settings

const sharedSetting = requireOption(path.join(root, 'settings')) || {}
const byEnironmentSetting =
  process.env.NODE_ENV === 'production'
    ? requireOption(path.join(root, 'settings.production')) || {}
    : requireOption(path.join(root, 'settings.development')) || {}

const settings = deepmerge(sharedSetting, byEnironmentSetting)

const { defaultSite = 'www', lang = 'en', port = 5000 } = settings

// load lang

const i18n = requireOption(`./src/lang/${lang}`)

// load engine getter

// Get subsite list

const fastify = requireOption('fastify')({
  logger: true,
  rewriteUrl(req) {
    const subsite = getSubsite(req.headers.host, defaultSite)
    return subsite + req.url
  },
})

// Register static file handlers

for (const site of sites) {
  fastify.register(subsitePlugin, {
    prefix: site,
    _duosite: {
      siteRoot: path.join(root, siteRootName, site),
    },
  })
}

// Run the server!
fastify.listen(port, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(chalk.green(i18n.startMessage(port)))
})
