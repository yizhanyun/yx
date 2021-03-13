import chalk from 'chalk'
import path from 'path'

/**
 * Boot a template's static props with params
 * @param {Object} options - param options
 * @param {string} file - template file, root is 'pages'
 * @param {Object} params - params
 * @param {string []} whichOnes - array of ['static', 'server', 'paths']
 * @param {Object} _duosite - duosite object
 * @param {Object} request - request object
 * @param {Object} reply - reply object -
 */

const bootTemplateProps = async options => {
  const { file, params, _duosite, request, reply, whichOnes } = options

  let bootJs
  const {
    site: { root: siteRoot, engine },
    global,
  } = _duosite

  const i18nm = global.i18nMessages

  const bootJsPath = path.join(siteRoot, 'pages', file + '.boot.mjs')
  try {
    bootJs = await import(bootJsPath)
  } catch (e) {
    // console.log(e)
  }
  // if (bootJs && bootJs.getServerProps && bootJs.getStaticProps)
  //   throw new Error('Cannot have both getServerProps and getStaticProps')
  // console.log('---------', params)
  const booted = {}

  for (const type of whichOnes || []) {
    if (type === 'static' && bootJs && bootJs.getStaticProps) {
      booted.staticProps = await bootJs.getStaticProps({
        _duosite,
        params,
        request,
        reply,
      })
    }
    if (type === 'server' && bootJs && bootJs.serverProps) {
      booted.serverProps = await bootJs.getServerProps({
        _duosite,
        params,
        request,
        reply,
      })
    }

    if (type === 'paths' && bootJs && bootJs.getStaticPaths) {
      const pathsGot = (await bootJs.getStaticPaths({ _duosite })) || {}
      booted.staticPaths = pathsGot.paths
      booted.fallback = pathsGot.fallback
    }
  }
  return booted
}

/**
 * Boot boot template's static paths
 * @param {Object} options - param options
 * @param {string} file - template file
 * @param {Object} _duosite - duosite object
 * @param {Object} request - request object
 * @param {Object} reply - reply object -
 */

const bootTemplateStaticPaths = async options => {
  const { file, _duosite, request, reply } = options

  let bootJs, staticPaths, fallback
  const {
    site: { root: siteRoot, engine },
    global,
  } = _duosite

  const i18nm = global.i18nMessages

  try {
    bootJs = await import(path.join(siteRoot, 'pages', file + '.boot.mjs'))
  } catch (e) {
    // console.log(e)
  }
  if (bootJs && bootJs.getStaticProps) {
    const pathsGot = (await bootJs.getStaticPaths({ _duosite })) || {}
    staticPaths = pathsGot.paths
    fallback = pathsGot.fallback
  }

  return {
    staticPaths,
    fallback,
  }
}

/**
 * Server a template with already booted value
 * @param {Object} options - param options
 * @param {Object} params - routing parameters
 * @param {Object} _duosite - duosite object
 * @param {Object} booted - already booted
 * @param {Object} request - request object
 * @param {Object} reply - reply object -
 */

const serveTemplate = async options => {
  const { params, _duosite, booted, request, reply, file: _file } = options
  const file = path.join('pages', _file)
  const {
    site: { root: siteRoot, engine },
    global,
  } = _duosite

  const i18nm = global.i18nMessages

  reply.headers({ 'Content-Type': 'text/html' })

  if (engine.renderToStream) {
    const htmlStream = engine.renderToStream(file, {
      ...booted,
      params,
      _ctx: { request, reply, _duosite },
    })

    reply.send(htmlStream)
  } else if (engine.renderToStringAsync) {
    const htmlString = await engine.renderToStringAsync(file, {
      ...booted,
      params,
      _ctx: { request, reply, _duosite },
    })
    reply.send(htmlString)
  } else if (engine.renderToString) {
    const htmlString = engine.renderToStringAsync(file, {
      ...booted,
      params,
      _ctx: { request, reply, _duosite },
    })
    reply.send(htmlString)
  } else {
    throw new Error('View engine fails')
  }
}

/**
 * Build a template to file with provided booted value
 * @param {Object} options - param options
 * @param {string} outputFileName - output file name
 * @param {string} file - inputfile name
 * @param {Object} _duosite - duosite object
 * @param {Object} booted - already booted
 */

const buildToFile = async options => {
  const { outputFileName, file, _duosite, booted } = options

  const {
    site: { root: siteRoot, engine },
    global,
  } = _duosite

  const i18nm = global.i18nMessages

  if (engine.renderToFileAsync) {
    try {
      const outputHtmlPath = path.join(
        siteRoot,
        '.production',
        'pages',
        outputFileName + '.html'
      )
      await engine.renderToFileAsync(
        path.join('pages', file),
        {
          ...booted,
          _ctx: { _duosite },
        },
        outputHtmlPath
      )
      console.log(chalk.blue(i18nm.info), i18nm.writeBuildFile(outputHtmlPath))
    } catch (e) {
      // console.log(e)
    }
  } else if (engine.renderToFile) {
    try {
      const outputHtmlPath = path.join(
        siteRoot,
        '.production',

        'pages',
        outputFileName + '.html'
      )
      engine.renderToFile(
        path.join('pages', file),
        {
          ...booted,
          _ctx: { _duosite },
        },
        outputHtmlPath
      )
      console.log(chalk.blue(i18nm.info), i18nm.writeBuildFile(outputHtmlPath))
    } catch (e) {
      // console.log(e)
    }
  }
}

export {
  bootTemplateProps,
  bootTemplateStaticPaths,
  serveTemplate,
  buildToFile,
}
