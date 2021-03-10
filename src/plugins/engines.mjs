// Build engines

import { Liquid } from 'liquidjs'

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
        return { renderToStringAsync }
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
