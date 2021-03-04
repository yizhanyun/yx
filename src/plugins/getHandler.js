// Basic get handler
const path = require('path')

const { resolveUrlToFile } = require('../utils')

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

    console.log(params)
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

const genericGetRoute = {
  method: 'GET',
  url: '*',
  handler: genericGetHandler,
}

const buildFileRouters = (route, filename) => {
  return route.map(routeDef => {
    console.log(routeDef, filename)
    const [url] = routeDef
    return {
      method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'PATCH', 'OPTIONS'],
      url,
      handler: buildFileRouteHanlder(routeDef, path.join('pages', filename)),
    }
  })
}

module.exports = {
  genericGetRoute,
  buildFileRouters,
}
