// Basic get handler
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'

import { resolveUrlToFile, removeSuffix } from '../utils.mjs'

import {
  bootTemplateProps,
  bootTemplateStaticPaths,
  serveTemplate,
  buildToFile,
} from '../templateRunner.mjs'

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
    const [_file, resovledExt] = r

    // render rile
    const file = path.join('pages', _file)

    // server static
    if (resovledExt !== ext) {
      reply.sendFile(file, siteRoot)
      return reply
    }

    const { serverProps, staticProps } = await bootTemplateProps({
      file,
      params: request.params,
      _duosite,
      request,
      reply,
    })

    const booted = serverProps || staticProps

    serveTemplate({
      params: request.params,
      _duosite,
      booted,
      request,
      reply,
      file,
    })

    return reply
  }
}

const buildFileRouteHanlder = table => {
  const [, , filename] = table

  const file = path.join('pages', filename)

  const handler = async (request, reply) => {
    const params = request.params

    // render template

    const { _duosite, url } = request

    const {
      global: { i18nMessages: i18nm },
      site: { root: siteRoot, name: siteName, engine },
    } = _duosite

    const {
      site: { settings = {} },
      url: subsiteUrl,
    } = _duosite

    const { viewEngine = {} } = settings

    /* const subsiteUrl = url.replace(siteName + '/', '') */
    const r = await resolveUrlToFile(siteRoot, subsiteUrl, viewEngine)

    if (r && r[1] === '.html') {
      reply.sendFile(path.join('pages', r[0]), siteRoot)
      return reply
    } else {
      const { serverProps, staticProps } = await bootTemplateProps({
        params: request.params,
        file,
        _duosite,
        request,
        reply,
        whichOnes: ['static', 'server'],
      })

      const booted = serverProps || staticProps

      serveTemplate({
        params: request.params,
        _duosite,
        booted,
        request,
        reply,
        file,
      })

      if (staticProps) {
        const outputFileName = subsiteUrl.endsWith(viewEngine.ext)
          ? removeSuffix(subsiteUrl)
          : subsiteUrl
        buildToFile({ outputFileName, file, _duosite, booted })
      }
      return reply
    }
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
    handler: buildFileRouteHanlder(table),
  }
}

export { genericGetRoute, buildFileRouter, buildApiRouter }
