// Basic get handler
import path from 'path'

import { resolveUrlToFile, removeSuffix } from '../utils.mjs'

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
        bootJs = await import(path.join(siteRoot, file + '.boot.mjs'))
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

const buildFileRouteHanlderNew = table => {
  const [, , filename] = table

  const file = path.join('pages', filename)

  const handler = async (request, reply) => {
    const params = request.params

    // render template

    const { _duosite } = request

    const {
      site: { root: siteRoot, engine },
    } = _duosite

    let booted
    let bootJs
    try {
      bootJs = await import(path.join(siteRoot, file + '.boot.mjs'))
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

const buildApiRouter = async (table, siteRoot) => {
  let router

  const [url, , file, type] = table

  try {
    router = (await import(path.join(siteRoot, 'api', file))).default
  } catch (e) {}

  if (!router) {
    return {
      method: allMethods,
      handler: function (request, reply) {
        reply.statusCode = 404
        reply.send()
      },
    }
  } else if (url && type !== 'static') return { ...router, url: '/api/' + url }
  // parsed router
  else {
    const _url = removeSuffix(url)

    return { ...router, url: '/api/' + _url }
  }
}

const genericGetRoute = {
  method: 'GET',
  url: '*',
  handler: genericGetHandler,
}

const buildFileRouter = table => {
  const [url] = table

  return {
    method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'PATCH', 'OPTIONS'],
    url: '/' + url,
    handler: buildFileRouteHanlderNew(table),
  }
}

export { genericGetRoute, buildFileRouter, buildApiRouter }
