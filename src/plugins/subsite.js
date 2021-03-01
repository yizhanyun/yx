const deepmerge = require('deepmerge')
const fastifyStatic = require('fastify-static')
const path = require('path')

const { genericGetRoute } = require('./getHandler')

const buildEngine = require('./engines')

const requireOption = path => {
  try {
    return require(path)
  } catch (e) {
    return undefined
  }
}

//  Plugin to handle each subsite's request

// opts: { prefix, _duosite: { siteRoot }}

const subsite = function (fastify, opts, done) {
  const {
    _duosite: { siteRoot, globalSettings, globalServices, i18nMessages, site },
  } = opts

  const sharedSetting = requireOption(`${siteRoot}/settings`) || {}
  const byEnironmentSetting =
    process.env.NODE_ENV === 'production'
      ? requireOption(`./${siteRoot}/settings.production`) || {}
      : requireOption(`./${siteRoot}/settings.development`) || {}

  const settings = deepmerge(sharedSetting, byEnironmentSetting)

  const {
    staticRoot = 'static', // Root for statics that are serverved as is.
    staticCompiledRoot = 'bundle', // Root for statics that are generated by bundlers
    viewEngine = {},
  } = settings

  const { name, ext, options = {} } = viewEngine

  fastify.register(fastifyStatic, {
    root: path.join(siteRoot, 'public', staticRoot),
    prefix: `/${staticRoot}`,
  })

  if (staticCompiledRoot !== staticRoot) {
    fastify.register(fastifyStatic, {
      root: path.join(siteRoot, 'public', staticCompiledRoot),
      prefix: `/${staticCompiledRoot}`,
      decorateReply: false, // the reply decorator has been added by the first plugin registration
    })
  }

  fastify.decorateRequest('_duosite', null)

  let engine

  if (name && ext) {
    engine = buildEngine(siteRoot, name, ext, options, i18nMessages)
  }

  // run local enhancer

  console.log(i18nMessages.runningSiteEnhancer(site))
  const enhance = requireOption(`${siteRoot}/src/enhancer`)

  enhance &&
    enhance(fastify, siteRoot, settings, globalSettings, globalServices)

  // enhance request

  fastify.addHook('preHandler', (request, reply, done) => {
    request._duosite = {
      settings,
      siteRoot,
      engine,
      globalSettings,
      globalServices,
    }
    done()
  })

  fastify.route(genericGetRoute)

  done()
}

module.exports = subsite
