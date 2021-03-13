// Build engines

import { Liquid } from 'liquidjs'
// Break full path to path and filename
import path from 'path'
import fs from 'fs'

const breakFullpath = fullpath => {
  const segs = fullpath.split(path.sep)

  const fileName = segs.pop()
  return [segs.join(path.sep), fileName]
}

const build = async _duosite => {
  console.log('=====================================')
  console.log('Demo: build site custom view engine')
  console.log('======================================')

  try {
    const {
      global: { i18nMessages: i18n },
      site: {
        settings: {
          viewEngine: { options, ext },
        },
        root,
      },
    } = _duosite

    switch (ext) {
      case '.liquid': {

        const liquid = new Liquid({ ...options, root })
        const renderToStringAsync = async (file, options) => {
          return liquid.renderFile(file, options)
        }
        const renderToFileAsync = async (file, options, outFile) => {

          const [outParent] = breakFullpath(outFile)

          if (!fs.existsSync(outParent))
            fs.mkdirSync(outParent, { recursive: true })
          const out = fs.createWriteStream(outFile, { encoding: 'utf8' })
          const s = await liquid.renderFile(file, options)
          out.once('open', function () {
            out.write(s)
            out.close()
          })
        }
        return { renderToStringAsync, renderToFileAsync }
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
