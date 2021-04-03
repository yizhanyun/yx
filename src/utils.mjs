import fs from 'fs'
import path from 'path'

import fsp from 'fs/promises'

import deepmerge from 'deepmerge'
import chalk from 'chalk'

import { pathToFileURL } from 'url'

// Get directories of a directory
const getDirectories = source =>
  fs
    .readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

// get subsite
const getSubsite = (host, defaultSite) => {
  const segments = host.split('.')

  // For [...].nn.abc.com && nn.abc.com, return nn as subsite domain
  // For abc.com, return defaultSite
  return segments.length > 1 ? segments[segments.length - 2] : defaultSite
}

/**
 * Get suffix
 */

const suffix = filename => {
  const segments = filename.split('.')
  if (segments.length === 1) return ''
  else return '.' + segments[segments.length - 1]
}

/**
 * check if file exists
 * @param {string} path - file's full path
 * @param {string} ext -  file's extension
 * @return {[string, string] | undefined} - resolved file path and extension
 */

const fileExist = async (path, ext) => {
  try {
    await fsp.stat(path)
    return [path, ext]
  } catch (e) {
    return undefined
  }
}

/**
 * resolve url to static file
 * @param {string} siteRoot - Site's root
 * @param {string} url - Url
 * @param {Object} viewEngine - viewEngine config
 * @param {string} viewEngine.name - viewEngine name
 * @param {string} viewEngine.ext - viewEngine template extension
 * @param {Object} viewEngine.options - viewEngine options
 * @return {[string, string] | undefined} - resolved file path and extension
 */

const resolveUrlToFile = async (siteRoot, url, viewEngine) => {
  const { ext: viewEngineExt } = viewEngine || {}

  try {
    if (url.endsWith('/')) {
      // resolve /abc/ to /abc/index.html or /abc/index.ext

      const rpath = path.join(url, 'index.html')
      const htmlPath = path.join(siteRoot, 'pages', rpath) // check html

      try {
        // resolve /abc/ to /abc/index.html

        await fsp.stat(htmlPath)
        return [rpath, '.html']
      } catch (_) {
        if (!viewEngineExt) return undefined
        else {
          // resolve /abc/ to /abc/index.ext

          const rpath = path.join(url, 'index' + viewEngineExt)

          const viewPath = path.join(siteRoot, 'pages', rpath)
          await fsp.stat(viewPath)
          return [rpath, viewEngineExt]
        }
      }
    } else {
      const segments = url.split('/')
      const lastSegment = segments[segments.length - 1]

      const ext = suffix(lastSegment)
      if (ext && url.endsWith('.boot.mjs')) {
        // special file
        return undefined
      } else if (ext) {
        // resolve /abc/def.suffix to actual file /abc/def.suffix
        const rpath = path.join(url)
        const r = await fileExist(path.join(siteRoot, 'pages', url), ext)
        if (r) return [rpath, ext]
        else return undefined
      } else {
        const rpath = path.join(url + '.html')

        const r = await fileExist(
          // resolve /abc/def to /abc/def/index.html

          path.join(siteRoot, 'pages', rpath),
          '.html'
        )

        if (r) return [rpath, '.html']
        else {
          if (viewEngineExt) {
            // resolve /abc/def to /abc/def/index.ext

            const rpath = path.join(url + viewEngineExt)

            const r = await fileExist(
              path.join(siteRoot, 'pages', rpath),
              viewEngineExt
            )

            if (r) return [rpath, viewEngineExt]
            // resolve /abc/def to /abc/def/
            else return resolveUrlToFile(siteRoot, url + '/', viewEngine)
          } else return resolveUrlToFile(siteRoot, url + '/', viewEngine) // resolve /abc/def to /abc/def/
        }
      }
    }
  } catch (e) {
    // console.log(e)
    return undefined
  }
}

/** Load global settings
 * @param { string} yxRoot - yx root
 * @return { Object } globalSettings - global settings
 */

const loadGlobalSettings = async root => {
  let sharedSetting, byEnironmentSetting
  try {
    sharedSetting = (
      await import(pathToFileURL(path.join(root, 'settings.mjs')))
    ).default
  } catch (e) {
    // console.log(e)
  }

  try {
    byEnironmentSetting =
      process.env.NODE_ENV === 'production'
        ? (
            await import(
              pathToFileURL(path.join(root, 'settings.production.mjs'))
            )
          ).default
        : (
            await import(
              pathToFileURL(path.join(root, 'settings.development.mjs'))
            )
          ).default
  } catch (e) {
    // console.log(e)
  }

  return deepmerge(sharedSetting || {}, byEnironmentSetting || {})
}

/** Load global i18n messages
 * @param { string} yxRoot - yx root
 * @param { string} lang - language locale
 * @return { Object } i18n messages
 */

const loadGlobalI18NMessages = async (yxRoot, _lang) => {
  if (!_lang)
    console.log(
      chalk.yellow('■ warning'),
      'Local not defined in settings. Use English.'
    )

  const lang = _lang || 'en'

  let i18nMessagesSite, i18nMessagesDefault

  try {
    i18nMessagesSite = (
      await import(
        pathToFileURL(
          path.join(yxRoot, 'src', 'lang', 'messages', `${lang}.mjs`)
        )
      )
    ).default
  } catch (e) {
    // console.log(e)
  }

  try {
    i18nMessagesDefault = (await import(`./lang/messages/${lang}.mjs`)).default
  } catch (e) {
    // console.log(e)
  }

  if (!i18nMessagesSite && !i18nMessagesDefault) {
    console.log(
      chalk.yellow('■ warning'),
      `Language dictionary for ${lang} not found. Use English as fallback`
    )

    let _i18nMessagesSite, _i18nMessagesDefault

    try {
      _i18nMessagesSite =
        i18nMessagesSite ||
        (
          await import(
            pathToFileURL(
              path.join(yxRoot, 'src', 'lang', 'messages', 'en.mjs')
            )
          )
        ).default
      _i18nMessagesDefault =
        i18nMessagesDefault || (await import('./lang/messages/en.mjs')).default
    } catch (e) {
      // console.log(e)
    }

    return deepmerge(_i18nMessagesSite || {}, _i18nMessagesDefault || {})
  } else return deepmerge(i18nMessagesSite, i18nMessagesDefault)
}

/**
 * Recursively read directory
 * @param  {string[]=[]} arr This doesn't have to be provided, it's used for the recursion
 * @param  {string=dir`} rootDir Used to replace the initial path, only the relative path is left, it's faster than path.relative.
 * @returns Array holding all relative paths with file type as [path, 'f' | 'd'], f -> file, d -> directory
 */
const recursiveReadDirSync = (dir, arr = [], rootDir = dir) => {
  const result = fs.readdirSync(dir)

  result.forEach(part => {
    const absolutePath = path.join(dir, part)
    const pathStat = fs.statSync(absolutePath)

    if (pathStat.isDirectory()) {
      arr.push([absolutePath.replace(rootDir, ''), 'd'])
      recursiveReadDirSync(absolutePath, arr, rootDir)
      return
    }
    arr.push([absolutePath.replace(rootDir, ''), 'f'])
  })

  return arr
}

/**
 * Remove a filepath's suffix
 * @param {string} filepath - file path
 * @return {string} filename without suffix
 */

const removeSuffix = filepath => {
  const segs = filepath.split('.')

  if (segs.length === 1) return filepath

  segs.pop()

  return segs.join('.')
}

/** last item of array
 *
 */

const lastItem = arr => arr[arr.length - 1]

const parseRouteSegment = segment => {
  {
    const optionalCatchAllRgex = /\[\[\.\.\.([A-Za-z_]\w*)\]\]/g
    const result = optionalCatchAllRgex.exec(segment)
    if (result) return [result[1], 'optionalCatchAll'] // optional catch all
  }

  {
    const catchAllRgex = /\[\.\.\.([A-Za-z_]\w*)\]/g
    const result = catchAllRgex.exec(segment)
    if (result) return [result[1], 'catchAll'] // catch all
  }

  {
    if (segment.startsWith('[[') || segment.endsWith(']]'))
      return [segment, 'error']

    const catchRgex = /\[([A-Za-z_]\w*)\]/g
    const result = catchRgex.exec(segment)
    if (result) return [result[1], 'catch'] // catch all
  }

  {
    const staticRgex = /(^\w*)/g
    const result = staticRgex.exec(segment)
    if (result) return [segment, 'static']
    // catch all
    else return [segment, 'error']
  }
}

/**
 * segmentTypes: catch, catchAll, optionalCatchAll, static, error
 */

/**
 * @param {string[]} segments - route segments
 * @return {[boolean, [routeSegment]} [is route or not, routes]
 *  routeSegment format : [':paramName', paramName] or ['*', paramName]
 */

const segmentsToRoute = segments => {
  const parsedSegments = segments.map(segment => parseRouteSegment(segment))

  let hasCatchAllBeforeLast = false
  let lastSegmentType
  let hasError = false

  const length = parsedSegments.length - 1
  parsedSegments.forEach((parsed, index) => {
    // before last item
    const [, segmentType] = parsed
    // if (hasCatchBeforeLast && segmentType === 'static')
    //   hasStaticAfterCatch = true

    hasError = hasError || segmentType === 'error'

    if (index < length - 1) {
      // if (segmentType === 'catch') hasCatchBeforeLast = true
      if (segmentType === 'catchAll' || segmentType === 'optionalCatchAll')
        hasCatchAllBeforeLast = true
    } else {
      lastSegmentType = segmentType
    }
  })

  const routeType =
    hasError || hasCatchAllBeforeLast ? 'error' : lastSegmentType

  return [routeType, parsedSegments]
}

const buildFilesRoutingTable = (root, ext) => {
  const filesTable = recursiveReadDirSync(root).filter(
    ([filename, filetype]) => {
      if (filetype === 'd') return false
      return (
        (filename.endsWith(ext) || filename.endsWith('.html')) &&
        !filename.endsWith('.boot.mjs')
      )
    }
  )

  const routes = filesTable.map(([filename, filetype]) => {
    const segments = filename.split(path.sep).filter(s => !!s)
    return [...segmentsToRoute(segments), filename]
  })

  return routes
}

/** Build file routing
 * @param {string} root - root for router files
 * @param {string} ext - extension of template file
 * @param {string} target - target routing framework, default and only support fastify now
 * @return {[[string, string]]} - array of [router string, filepath]
 */

const buildCatchRoutingTable = routes => {
  const catchRoutes = routes.filter(
    ([routeType]) => routeType !== 'error' && routeType !== 'static'
  )

  return catchRoutes
}

const buildApiRoutingTable = (root, ext, target = 'fastify') => {
  const dirTree = recursiveReadDirSync(root).filter(([filename, filetype]) => {
    if (filetype === 'd') return false
    return filename.endsWith(ext)
  })

  const routes = dirTree
    .map(([filename, filetype]) => {
      const segments = filename.split(path.sep).filter(s => !!s)
      return [...segmentsToRoute(segments), filename]
    })
    .filter(([routeType]) => routeType !== 'error')

  return routes
}

const buildFileRouteUrlVariableTable = (routes, target = 'fastify') => {
  return routes.map(([routeType, segments, filename]) => {
    if (routeType === 'catch') {
      const _variables = []
      const segs = []

      segments.forEach(([segName, segType]) => {
        if (segType !== 'static') {
          _variables.push(segName)
          segs.push(':' + segName)
        } else segs.push(segName)
      })

      const url = segs.join('/')
      return [[url, _variables, filename, routeType]]
    } else if (routeType === 'catchAll') {
      const _variables = []
      const segs = []

      segments.forEach(([segName, segType], index) => {
        if (segType !== 'static') {
          if (segType === 'catchAll') {
            _variables.push('*')
          } else _variables.push(segName)
        }
        if (index === segments.length - 1) {
          segs.push('*')
        } else if (segType !== 'static') segs.push(':' + segName)
        else segs.push(segName)
      })

      // const variables = _variables.filter(segName => !!segName)

      const url = segs.join('/')
      return [[url, _variables, filename, routeType]]
    } else {
      const _variables = []
      const segsWithTail = []
      const segsWithNoTail = []

      segments.forEach(([segName, segType], index) => {
        if (segType !== 'static') {
          if (segType === 'optionalCatchAll') {
            _variables.push('*')
          } else _variables.push(segName)
        }
        if (index === segments.length - 1) {
          segsWithTail.push('*')
        } else if (segType !== 'static') {
          segsWithTail.push(':' + segName)
          segsWithNoTail.push(':' + segName)
        } else {
          segsWithTail.push(segName)
          segsWithNoTail.push(segName)
        }
      })

      const urlWithTail = segsWithTail.join('/')
      const urlWithNoTail = segsWithNoTail.join('/')
      return [
        [urlWithTail, _variables, filename, routeType],
        [urlWithNoTail, _variables, filename, routeType],
      ]
    }
  })
}

const buildApiRouteUrlVariableTable = (routes, target = 'fastify') => {
  return routes.map(([routeType, segments, filename]) => {
    if (routeType === 'static') {
      const _variables = []
      const segs = []

      segments.forEach(([segName, segType]) => {
        segs.push(segName)
      })

      const url = segs.join('/')
      return [[url, _variables, filename, routeType]]
    } else if (routeType === 'catchAll') {
      const _variables = []
      const segs = []

      segments.forEach(([segName, segType], index) => {
        if (segType !== 'static') {
          if (segType === 'catchAll') {
            _variables.push('*')
          } else _variables.push(segName)
        }
        if (index === segments.length - 1) {
          segs.push('*')
        } else if (segType !== 'static') segs.push(':' + segName)
        else segs.push(segName)
      })

      // const variables = _variables.filter(segName => !!segName)

      const url = segs.join('/')
      return [[url, _variables, filename, routeType]]
    } else if (routeType === 'catch') {
      const _variables = []
      const segs = []

      segments.forEach(([segName, segType]) => {
        if (segType !== 'static') {
          _variables.push(segName)
          segs.push(':' + segName)
        } else segs.push(segName)
      })

      const url = segs.join('/')
      return [[url, _variables, filename, routeType]]
    } else if (routeType === 'catchAll') {
      const _variables = []
      const segs = []

      segments.forEach(([segName, segType], index) => {
        if (segType !== 'static') {
          if (segType === 'catchAll') {
            _variables.push('*')
          } else _variables.push(segName)
        }
        if (index === segments.length - 1) {
          segs.push('*')
        } else if (segType !== 'static') segs.push(':' + segName)
        else segs.push(segName)
      })

      // const variables = _variables.filter(segName => !!segName)

      const url = segs.join('/')
      return [[url, _variables, filename, routeType]]
    } else {
      const _variables = []
      const segsWithTail = []
      const segsWithNoTail = []

      segments.forEach(([segName, segType], index) => {
        if (segType !== 'static') {
          if (segType === 'optionalCatchAll') {
            _variables.push('*')
          } else _variables.push(segName)
        }
        if (index === segments.length - 1) {
          segsWithTail.push('*')
        } else if (segType !== 'static') {
          segsWithTail.push(':' + segName)
          segsWithNoTail.push(':' + segName)
        } else {
          segsWithTail.push(segName)
          segsWithNoTail.push(segName)
        }
      })

      const urlWithTail = segsWithTail.join('/')
      const urlWithNoTail = segsWithNoTail.join('/')
      return [
        [urlWithTail, _variables, filename, routeType],
        [urlWithNoTail, _variables, filename, routeType],
      ]
    }
  })
}

const buildGeneratedFileName = (table, params) => {
  const segments = table.map(([segName, type]) => {
    if (type === 'static') {
      return segName
    }
    if (type === 'catch') {
      return params[segName]
    }
    if (type === 'catchAll' || type === 'optionalCatchAll') {
      return params[segName] || params['*']
    }
    throw new Error(`Catch variable ${segName}not provided`)
  })

  return path.join(...segments)
}

// Break full path to path and filename
const breakFullpath = fullpath => {
  const segs = fullpath.split(path.sep)

  const fileName = segs.pop()
  return [segs.join(path.sep), fileName]
}

export {
  getDirectories,
  getSubsite,
  resolveUrlToFile,
  fileExist,
  loadGlobalSettings,
  loadGlobalI18NMessages,
  recursiveReadDirSync,
  removeSuffix,
  buildCatchRoutingTable,
  buildApiRoutingTable,
  segmentsToRoute,
  parseRouteSegment,
  buildFileRouteUrlVariableTable,
  buildApiRouteUrlVariableTable,
  buildFilesRoutingTable,
  lastItem,
  buildGeneratedFileName,
  breakFullpath,
}
