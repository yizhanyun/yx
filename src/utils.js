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

const loadGlobalI18NMessages = (duositeRoot, lang) => {
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

module.exports = {
  getDirectories,
  getSubsite,
  resolveUrlToFile,
  fileExist,
  loadGlobalSettings,
  loadGlobalI18NMessages,
}
