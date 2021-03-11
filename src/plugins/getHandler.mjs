// Basic get handler
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'

import { resolveUrlToFile, removeSuffix } from '../utils.mjs'

/** run a template
 *  @param {Object} options - options
 * @param {string}  options.mode - mode: build, serve, serveAndFallback
 * @param {Object || undefined} options.request - request
 * @param {string} options.catchType - static/catch/catchAll
 * @param {string} options.url - request url
 * @param {Object} options._duosite - _duosite config
 * @param {string} options.file - resolved file
 */

const runTemplate = async options => {
  const { request, reply, catchType, file, mode, url, _duosite } = options

  const {
    global: { i18nMessages: i18nm },
    site: { root: siteRoot, engine },
    url: subsiteUrl,
  } = _duosite

  if (mode !== 'build') {
    const params = request.params

    let booted
    let bootJs

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

    if (mode === 'serverAndFallback' && bootJs && bootJs.getStaticProps) {
      if (engine.renderToFileAsync) {
        try {
          const outputHtmlPath = path.join(
            siteRoot,
            'pages',
            subsiteUrl + '.html'
          )
          await engine.renderToFileAsync(
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
  } else {
    let booted
    let bootJs
    try {
      bootJs = await import(path.join(siteRoot, 'pages', file + '.boot.mjs'))
    } catch (e) {
      // console.log(e)
    }

    let paths, fallback

    if (bootJs && !bootJs.getServerProps && bootJs.getStaticPaths) {
      const pathsGot = (await bootJs.getStaticPaths({ _duosite })) || {}
      paths = pathsGot.paths
      fallback = pathsGot.fallback
    }

    if (paths && bootJs.getStaticProps) {
      for (const staticPath of paths) {
        const { params } = staticPath
        const outputFileName = buildGeneratedFileName(table, params)
        booted = await bootJs.getStaticProps({ _duosite, params })

        console.log('-------------', booted)

        if (bootJs && bootJs.getStaticProps) {
          if (engine.renderToFileAsync) {
            try {
              const outputHtmlPath = path.join(
                siteRoot,
                'pages',
                outputFileName + '.html'
              )
              await engine.renderToFileAsync(
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
                outputFileName + '.html'
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
                outputFileName + '.html'
              )
              await fs.outputFile(outputHtmlPath, output)
              console.log(chalk.green(i18nm.writeBuildFile(outputHtmlPath)))
            } catch (e) {
              console.log(e)
            }
          }
        }
      }
    }
    if (!bootJs || bootJs.getServerProps || fallback) {
      const filesForCopy = [file, file + '.boot.mjs']

      filesForCopy.forEach(file => {
        const target = path.join(siteRoot, '.production', 'pages', file)
        try {
          fs.copySync(path.join(siteRoot, 'pages', file), target)
        } catch (e) {
          // console.log(e)
        }
      })
    }
  }
}

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

    // server static
    if (resovledExt !== ext) {
      reply.sendFile(file, siteRoot)
      return reply
    }

    // render rile
    const file = path.join('pages', _file)

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

    // marko: use @marko-fastify
    console.log('%%%%%%%%%%%%%%%%%%%%%% renderring', viewEngine.ext, engine)

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
          await engine.renderToFileAsync(
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

    console.log('============== r', r)
    if (r && r[1] === '.html') {
      reply.sendFile(path.join('pages', r[0]), siteRoot)
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
            await engine.renderToFileAsync(
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
