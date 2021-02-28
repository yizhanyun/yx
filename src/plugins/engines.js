// Build engines

const { Liquid } = require('liquidjs')

const build = (root, name, ext, options) => {
  switch (name) {
    case 'liquid': {
      return new Liquid({ ...options, root })
    }
    default:
      throw new Error('Unsupported Engine')
  }
}

module.exports = build
