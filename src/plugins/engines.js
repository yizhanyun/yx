// Build engines

const { Liquid } = require('liquidjs')

const build = (siteRoot, name, ext, options, lang, i18n, i18nm) => {
  switch (name) {
    case 'liquid': {
      return new Liquid({ ...options, root: siteRoot })
    }
    default:
      throw new Error(i18n.engineNotSupported)
  }
}

module.exports = build
