// Basic get handler
const path = require('path')

const { resolveUrlToFile, removeFileSuffix } = require('../utils')

const genericGetHandler = async function (request, reply) {
  const { _duosite } = request

  const {
    site: { root: siteRoot, engine, settings = {} },
  } = _duosite

  const { viewEngine = {} } = settings

  const { ext } = viewEngine

  const url = request.params['*']
  const r = await resolveUrlToFile(siteRoot, url, viewEngine)
  if (!r) {
    reply.statusCode = 404
    reply.send()
    return reply
  } else {
    const [file, resovledExt] = r

    if (ext === resovledExt) {
      let booted
      let bootJs
      try {
        bootJs = require(path.join(siteRoot, file + '.boot.js'))
      } catch (e) {
        console.log(e)
      }

      if (bootJs && bootJs.getServerProps) {
        booted = await bootJs.getServerProps({ request, reply })
      }

      const output = await engine.renderFile(file, {
        ...booted,
        _ctx: { request, reply },
      })
      reply.headers({ 'Content-Type': 'text/html' })
      reply.send(output)
      return reply
    } else {
      reply.sendFile(file, siteRoot)
      return reply
    }
  }
}

const buildFileRouteHanlder = (routeDef, file) => {
  const handler = async (request, reply) => {
    const [variables, type] = routeDef

    let params = {}

    if (type === 'optionalCatchAllWithTail') {
      params[variables[0]] = request.params['*'].split('/')
    } else if (type === 'optionalCatchAllWithNoTail') {
      params[variables[0]] = undefined
    } else if (type === 'catch') params = request.params

    // render template

    const { _duosite } = request

    const {
      site: { root: siteRoot, engine },
    } = _duosite

    let booted
    let bootJs
    try {
      bootJs = require(path.join(siteRoot, file + '.boot.js'))
    } catch (e) {
      // console.log(e)
    }

    if (bootJs && bootJs.getServerProps) {
      booted = await bootJs.getServerProps({
        _ctx: { request, reply },
        params,
        query: request.query,
      })
    }

    const output = await engine.renderFile(file, {
      ...booted,
      params,
      query: request.query,
      _ctx: { request, reply },
    })
    reply.headers({ 'Content-Type': 'text/html' })
    reply.send(output)
    return reply
  }
  return handler
}

const allMethods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'PATCH', 'OPTIONS']

const buildApiRouter = (routeDef, file, siteRoot) => {
  let router

  const [url, , type] = routeDef

  try {
    router = require(path.join(siteRoot, 'api', file))
  } catch (e) {}

  if (!router) {
    return {
      method: allMethods,
      handler: function (request, reply) {
        reply.statusCode = 404
        reply.send()
      },
    }
  } else if (url && type !== 'static') return { ...router, url: '/api' + url }
  // parsed router
  else {
    const _url = removeFileSuffix(file)

    return { ...router, url: '/api' + _url }
  }
}

const genericGetRoute = {
  method: 'GET',
  url: '*',
  handler: genericGetHandler,
}

const buildFileRouters = (route, filename) => {
  return route.map(routeDef => {
    const [url] = routeDef
    return {
      method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'PATCH', 'OPTIONS'],
      url,
      handler: buildFileRouteHanlder(routeDef, path.join('pages', filename)),
    }
  })
}

const buildApiRouters = (route, filename, siteRoot) => {
  return route.map(routeDef => {
    return buildApiRouter(routeDef, filename, siteRoot)
  })
}

module.exports = {
  genericGetRoute,
  buildFileRouters,
  buildApiRouters,
}
