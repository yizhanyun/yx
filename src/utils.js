const fs = require('fs')
const path = require('path')

const fsp = require('fs/promises')

const deepmerge = require('deepmerge')

const requireOption = path => {
  try {
    return require(path)
  } catch (e) {
    return undefined
  }
}

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

      const rpath = path.join('pages', url, 'index.html')
      const htmlPath = path.join(siteRoot, rpath) // check html

      try {
        // resolve /abc/ to /abc/index.html

        await fsp.stat(htmlPath)
        return [rpath, '.html']
      } catch (_) {
        if (!viewEngineExt) return undefined
        else {
          // resolve /abc/ to /abc/index.ext

          const rpath = path.join('pages', url, 'index' + viewEngineExt)

          const viewPath = path.join(siteRoot, rpath)
          await fsp.stat(viewPath)
          return [rpath, viewEngineExt]
        }
      }
    } else {
      const segments = url.split('/')
      const lastSegment = segments[segments.length - 1]

      const ext = suffix(lastSegment)
      if (ext && url.endsWith('.boot.js')) {
        // special file
        return undefined
      } else if (ext) {
        // resolve /abc/def.suffix to actual file /abc/def.suffix
        const rpath = path.join('pages', url)
        await fileExist(path.join(siteRoot, 'pages', url), ext)
        return [rpath, ext]
      } else {
        const rpath = path.join('pages', url + '.html')

        const r = await fileExist(
          // resolve /abc/def to /abc/def/index.html

          path.join(siteRoot, rpath),
          '.html'
        )
        if (r) return [rpath, '.html']
        else {
          if (viewEngineExt) {
            // resolve /abc/def to /abc/def/index.ext

            const rpath = path.join('pages', url + viewEngineExt)

            const r = await fileExist(path.join(siteRoot, rpath), viewEngineExt)

            if (r) return [rpath, viewEngineExt]
            // resolve /abc/def to /abc/def/
            else return resolveUrlToFile(siteRoot, url + '/', viewEngine)
          } else return resolveUrlToFile(siteRoot, url + '/', viewEngine) // resolve /abc/def to /abc/def/
        }
      }
    }
  } catch (e) {
    console.log(e)
    return undefined
  }
}

/** Load global settings
 * @param { string} duositeRoot - duosite root
 * @return { Object } globalSettings - global settings
 */

const loadGlobalSettings = root => {
  const sharedSetting = requireOption(path.join(root, 'settings')) || {}
  const byEnironmentSetting =
    process.env.NODE_ENV === 'production'
      ? requireOption(path.join(root, 'settings.production')) || {}
      : requireOption(path.join(root, 'settings.development')) || {}

  return deepmerge(sharedSetting, byEnironmentSetting)
}

/** Load global i18n messages
 * @param { string} duositeRoot - duosite root
 * @param { string} lang - language locale
 * @return { Object } i18n messages
 */

const loadGlobalI18NMessages = (duositeRoot, _lang) => {
  if (!_lang) console.log('Local not defined in settings. Use English.')

  const lang = _lang || 'en'

  const i18nMessagesSite = requireOption(
    `${duositeRoot}/src/lang/messages/${lang}`
  )

  const i18nMessagesDefault = requireOption(`./lang/messages/${lang}`)

  if (!i18nMessagesSite && !i18nMessagesDefault) {
    console.log(
      `Language dictionary for ${lang} not found. Use English as fallback`
    )

    const _i18nMessagesSite =
      i18nMessagesSite || requireOption(`${duositeRoot}/src/lang/messages/en`)

    const _i18nMessagesDefault =
      i18nMessagesDefault || requireOption(`./lang/messages/en`)

    return deepmerge(_i18nMessagesSite, _i18nMessagesDefault)
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

const removeFileSuffix = filepath => {
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
    if (result) return ['*', result[1], 'optionalCatchAll'] // optional catch all
  }

  {
    const catchAllRgex = /\[\.\.\.([A-Za-z_]\w*)\]/g
    const result = catchAllRgex.exec(segment)
    if (result) return ['*', result[1], 'catchAll'] // catch all
  }

  {
    if (segment.startsWith('[[') || segment.endsWith(']]')) return null

    const catchRgex = /\[([A-Za-z_]\w*)\]/g
    const result = catchRgex.exec(segment)
    if (result) return [result[1], result[1], 'catch'] // catch all
  }

  return null
}

/**
 * @param {string[]} segments - route segments
 * @return {[boolean, [routeSegment]} [is route or not, routes]
 *  routeSegment format : [':paramName', paramName] or ['*', paramName]
 */

const segmentsToRoute = segments => {
  let hasRouteSegment = false
  let breakRules = false
  const parsedSegments = []
  segments.forEach((segment, index) => {
    const name =
      index === segments.length - 1 ? removeFileSuffix(segment) : segment

    const parsed = parseRouteSegment(name)
    // console.log('parsed ... &&&&', parsed, segment)
    const isRouteSegment =
      parsed && (index === segments.length - 1 ? true : parsed[0] !== '*')

    breakRules = breakRules || (hasRouteSegment && !isRouteSegment) // from first dynamic route to the end should all be dynamic
    if (
      hasRouteSegment &&
      index === segments.length - 1 &&
      parsed &&
      (parsed[2] === 'catchAll' || parsed[2] === 'optionalCatchAll')
    )
      breakRules = true

    hasRouteSegment = isRouteSegment || hasRouteSegment // has at at least one
    parsedSegments.push(isRouteSegment ? parsed : [name, name, 'plain'])
  })

  const isFileSystemRoute = hasRouteSegment && !breakRules

  if (!isFileSystemRoute) return [false, []]

  let routes
  if (lastItem(parsedSegments)[2] === 'optionalCatchAll') {
    const variableName = lastItem(parsedSegments)[1]
    const segs = parsedSegments.map(([segment, variableName, type]) =>
      segment === '*' || type === 'plain' ? segment : ':' + segment
    )
    const routeAllWithTail = segs.join('/')
    segs.pop()
    const routeAllWithNoTail = segs.join('/')
    routes = [
      [routeAllWithTail, [variableName], 'optionalCatchAllWithTail'],
      [routeAllWithNoTail, [variableName], 'optionalCatchAllWithNoTail'],
    ]
  } else if (lastItem(parsedSegments)[2] === 'catchAll') {
    const variableName = lastItem(parsedSegments)[1]

    const segs = parsedSegments.map(([segment, variableName, type]) =>
      segment === '*' || type === 'plain' ? segment : ':' + segment
    )

    const routeAllWithTail = segs.join('/')
    routes = [[routeAllWithTail, [variableName], 'optionalCatchAllWithTail']]
  } else {
    const segs = parsedSegments.map(([segment, variableName, type]) =>
      segment === '*' || type === 'plain' ? segment : ':' + segment
    )

    const variableNames = parsedSegments
      .filter(([segment, variableName, type]) => type === 'catch')
      .map(([segment, variableName, type]) => variableName)
    const routeAllWithTail = segs.join('/')
    routes = [[routeAllWithTail, [variableNames], 'catch']]
  }

  // console.log('>>>>>>>>>> routes is', segments, JSON.stringify(routes, null, 2))
  return [true, routes]
}

/** Build file routing
 * @param {string} root - root for router files
 * @param {string} ext - extension of template file
 * @param {string} target - target routing framework, default and only support fastify now
 * @return {[[string, string]]} - array of [router string, filepath]
 */

const buildFileRouting = (root, ext, target = 'fastify') => {
  const dirTree = recursiveReadDirSync(root).filter(([filename, filetype]) => {
    if (filetype === 'd') return false
    return filename.endsWith(ext)
  })

  const routes = dirTree
    .map(([filename, filetype]) => {
      const segments = filename.split('/')
      return [...segmentsToRoute(segments), filename]
    })
    .filter(([isRoute]) => isRoute)
    .map(([_, routeMaps, filename]) => [routeMaps, filename])

  return routes
}

module.exports = {
  getDirectories,
  getSubsite,
  resolveUrlToFile,
  fileExist,
  loadGlobalSettings,
  loadGlobalI18NMessages,
  recursiveReadDirSync,
  removeFileSuffix,
  buildFileRouting,
  segmentsToRoute,
  parseRouteSegment,
}
