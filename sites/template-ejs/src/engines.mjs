// Build engines

import ejs from 'ejs'
// Break full path to path and filename
import path from 'path'
import fs from 'fs'

const breakFullpath = fullpath => {
  const segs = fullpath.split(path.sep)

  const fileName = segs.pop()
  return [segs.join(path.sep), fileName]
}

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
      case '.ejs': {
        const renderToStringAsync = async (file, data) => {
          return ejs.renderFile(path.join(root, file), data, {
            ...options,
            async: true,
          })
        }
        const renderToFileAsync = async (file, data, outFile) => {
          const [outParent] = breakFullpath(outFile)

          if (!fs.existsSync(outParent))
            fs.mkdirSync(outParent, { recursive: true })

          const s = await ejs.renderFile(path.join(root, file), data, {
            ...options,
            async: true,
          })
          await fs.writeFileSync(outFile, s)
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
