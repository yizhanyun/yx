// Build engines

import { Liquid } from 'liquidjs'
import path from 'path'

import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('marko/node-require')

const build = async _duosite => {
  console.log('=====================================')
  console.log('Demo: build site custom view engine')
  console.log('======================================')

  try {
    const {
      global: { i18nMessages: i18n },
      site: {
        settings: {
          viewEngine: { ext },
        },
        root,
      },
    } = _duosite

    switch (ext) {
      case '.marko': {
        const renderFile = async (file, options, res) => {
          const template = require(path.join(root, file))
          console.log(JSON.stringify(template, null, 2))
          return template.default.render(options, res)
        }

        return { renderFile }
      }
      default:
        throw new Error(i18n.engineNotSupported)
    }
  } catch (e) {
    console.log(e)
    return undefined
  }
}

export default build
