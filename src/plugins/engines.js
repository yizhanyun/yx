// Build engines

const { Liquid } = require('liquidjs')

const build = (siteRoot, name, ext, options, lang, i18n) => {
  switch (name) {
    case 'liquid': {
      return new Liquid({ ...options, siteRoot })
    }
    default:
      throw new Error(i18n.engineNotSupported)
  }
}

module.exports = build
