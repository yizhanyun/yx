// Build engines

import { Liquid } from 'liquidjs'

const build = async _yx => {
  try {
    const {
      global: { i18nMessages: i18n },
      site: {
        settings: {
          viewEngine: { options, ext },
        },
        root,
      },
    } = _yx

    switch (ext) {
      case '.liquid': {
        return new Liquid({ ...options, root })
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
