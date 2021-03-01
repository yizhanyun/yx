// Build engines

const { Liquid } = require('liquidjs')

const build = (root, name, ext, options, i18n) => {
  switch (name) {
    case 'liquid': {
      return new Liquid({ ...options, root })
    }
    default:
      throw new Error(i18n.engineNotSupported)
  }
}

module.exports = build
