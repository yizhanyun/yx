const fs = require('fs')
const path = require('path')

const fsp = require('fs/promises')

// Get directories of a directory
const getDirectories = source =>
  fs
    .readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

// get subsite
const getSubsite = (host, defaultSite) => {
  const segments = host.split('.')
  return segments.length > 1 ? segments[0] : defaultSite
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

      if (ext) {
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
          }
          // resolve /abc/def to /abc/def/
          else return resolveUrlToFile(siteRoot, url + '/', viewEngine)
        }
      }
    }
  } catch (e) {
    console.log(e)
    return undefined
  }
}

module.exports = {
  getDirectories,
  getSubsite,
  resolveUrlToFile,
  fileExist,
}
