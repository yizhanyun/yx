// Build engines

import { Liquid } from 'liquidjs'
import fs from 'fs'
import { breakFullpath } from '../utils.mjs'

const build = async _duosite => {
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

          if (!fs.existsSync(outParent)) {
            fs.mkdirSync(outParent, { recursive: true })
          }

          const s = await liquid.renderFile(file, options)

          await fs.writeFileSync(outFile, s)
        }
        return { renderToStringAsync, renderToFileAsync }
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
