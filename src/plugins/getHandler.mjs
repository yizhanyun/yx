// Basic get handler
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'

import { resolveUrlToFile, removeSuffix } from '../utils.mjs'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const genericGetHandler = async function (request, reply) {
  const { _duosite } = request

  const {
    site: { root: siteRoot, engine, settings = {} },
  } = _duosite

  const { viewEngine = {} } = settings

  const { ext } = viewEngine

  const url = request.params['*']
  const r = await resolveUrlToFile(siteRoot, url, viewEngine)
  console.log('%%%%%%%%%%%%%%%%%%%%%%%', r, siteRoot, url)

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
        // console.log(e)
      }

      if (bootJs && bootJs.getServerProps) {
        booted = await bootJs.getServerProps({ request, reply })
      }

      if (ext === '.marko') {
        // marko: use @marko-fastify
        reply.headers({ 'Content-Type': 'text/html' })
        const htmlStream = engine.streamFile(file, {
          ...booted,
          params: request.params,
          _ctx: { request, reply, _duosite },
        })
        reply.send(htmlStream)
        return reply
      } else {
        const output = await engine.renderFile(file, {
          ...booted,
          params: request.params,
          _ctx: { request, reply, _duosite },
        })
        reply.headers({ 'Content-Type': 'text/html' })
        reply.send(output)
        return reply
      }
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
      reply.sendFile(r[0], siteRoot)
      return reply
    } else {
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
      } else if (bootJs && bootJs.getStaticProps) {
        booted = await bootJs.getStaticProps({
          _ctx: { request, reply },
          params,
          query: request.query,
        })
      }

      if (viewEngine.ext === '.marko') {
        // marko: use @marko-fastify
        reply.headers({ 'Content-Type': 'text/html' })
        if (engine.renderToStream) {
          const htmlStream = engine.renderToStream(file, {
            ...booted,
            params: request.params,
            _ctx: { request, reply, _duosite },
          })

          reply.send(htmlStream)
        } else if (engine.renderToStringAsync) {
          const htmlString = await engine.renderToStringAsync(file, {
            ...booted,
            params: request.params,
            _ctx: { request, reply, _duosite },
          })
          reply.send(htmlString)
        } else if (engine.renderToString) {
          const htmlString = engine.renderToStringAsync(file, {
            ...booted,
            params: request.params,
            _ctx: { request, reply, _duosite },
          })
          reply.send(htmlString)
        } else {
          throw new Error('View engine fails')
        }

        if (bootJs && bootJs.getStaticProps) {
          if (engine.renderToFileAsync) {
            try {
              const outputHtmlPath = path.join(
                siteRoot,
                'pages',
                subsiteUrl + '.html'
              )
              await engine.renderToFile(
                file,
                {
                  ...booted,
                  _ctx: { _duosite },
                },
                outputHtmlPath
              )
              console.log(chalk.green(i18nm.writeBuildFile(outputHtmlPath)))
            } catch (e) {
              console.log(e)
            }
          } else if (engine.renderToFile) {
            try {
              const outputHtmlPath = path.join(
                siteRoot,
                'pages',
                subsiteUrl + '.html'
              )
              engine.renderToFile(
                file,
                {
                  ...booted,
                  _ctx: { _duosite },
                },
                outputHtmlPath
              )
              console.log(chalk.green(i18nm.writeBuildFile(outputHtmlPath)))
            } catch (e) {
              console.log(e)
            }
          } else {
            const output = await engine.renderFile(file, {
              ...booted,
              _ctx: { _duosite },
            })

            try {
              const outputHtmlPath = path.join(
                siteRoot,
                'pages',
                subsiteUrl + '.html'
              )
              await fs.outputFile(outputHtmlPath, output)
              console.log(chalk.green(i18nm.writeBuildFile(outputHtmlPath)))
            } catch (e) {
              console.log(e)
            }
          }
        }
        return reply
      } else {
        const output = await engine.renderFile(file, {
          ...booted,
          params: request.params,
          _ctx: { request, reply, _duosite },
        })
        reply.headers({ 'Content-Type': 'text/html' })
        reply.send(output)

        if (bootJs && bootJs.getStaticProps) {
          try {
            const outputHtmlPath = path.join(
              siteRoot,
              'pages',
              subsiteUrl + '.html'
            )
            await fs.outputFile(outputHtmlPath, output)
            console.log(chalk.green(i18nm.writeBuildFile(outputHtmlPath)))
          } catch (e) {
            console.log(e)
          }
        }

        return reply
      }

      // const output = await engine.renderFile(file, {
      //   ...booted,
      //   params,
      //   query: request.query,
      //   _ctx: { request, reply, _duosite },
      // })

      // reply.headers({ 'Content-Type': 'text/html' })
      // reply.send(output)
      // return reply
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
    handler: buildFileRouteHanlderNew(table),
  }
}

export { genericGetRoute, buildFileRouter, buildApiRouter }
