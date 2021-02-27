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
  const segments = suffix.split('.')
  if (segments.length === 1) return ''
  else return segments[segments.length - 1]
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
  const { ext } = viewEngine || {}
  try {
    if (url.endsWith('/')) {
      // /index.html or /index.ext

      const htmlPath = path.join(siteRoot, 'pages', url, 'index.html') // check html
      console.log(htmlPath)
      try {
        await fsp.stat(htmlPath)
        return [htmlPath, '.html']
      } catch (_) {
        if (!ext) return undefined
        else {
          const viewPath = path.join(siteRoot, 'pages', url, 'index', ext)
          await fsp.stat(viewPath)
          return [viewPath, ext]
        }
      }
    } else {
      const segments = url.split('/')
      const lastSegment = segments[segments.length - 1]

      const ext = suffix(lastSegment)

      if (ext) {
        return await fileExist(path.join(siteRoot, 'pages', url), ext)
      } else {
        const r = await fileExist(
          path.join(siteRoot, 'pages', url, '.html'),
          '.html'
        )
        if (r) return r
        else {
          const r = await fileExist(path.join(siteRoot, 'pages', url, ext), ext)
          if (r) return r
          else return resolveUrlToFile(siteRoot + '/', 'pages', url, viewEngine)
        }
      }
    }
  } catch (e) {
    return undefined
  }
}

module.exports = {
  getDirectories,
  getSubsite,
  resolveUrlToFile,
  fileExist,
}
