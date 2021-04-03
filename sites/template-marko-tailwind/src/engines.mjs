// Build engines

import fs from 'fs-extra'

import path from 'path'

import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('marko/node-require')

// Break full path to path and filename
const breakFullpath = fullpath => {
  const segs = fullpath.split(path.sep)

  const fileName = segs.pop()
  return [segs.join(path.sep), fileName]
}

const build = async _yx => {
  try {
    const {
      global: { i18nMessages: i18n },
      site: {
        settings: {
          viewEngine: { ext },
        },
        root,
      },
    } = _yx

    switch (ext) {
      case '.marko': {
        const renderToStringAsync = async (file, options, res) => {
          const template = require(path.join(root, file))

          return template.default.renderToString(options, res)
        }
        const renderToStream = (file, options) => {
          const template = require(path.join(root, file))
          return template.default.stream(options)
        }
        const renderToFileAsync = async (file, options, outFile) => {
          const [outParent] = breakFullpath(outFile)

          if (!fs.existsSync(outParent))
            fs.mkdirSync(outParent, { recursive: true })
          const out = fs.createWriteStream(outFile, { encoding: 'utf8' })
          const template = require(path.join(root, file))
          await template.default.render(options, out)
        }

        return { renderToStringAsync, renderToStream, renderToFileAsync }
      }
      default:
        throw new Error(i18n.engineNotSupported)
    }
  } catch (e) {
    // console.log(e)
    return undefined
  }
}

export default build
