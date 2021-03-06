// Build engines

import { Liquid } from 'liquidjs'

const build = async (siteRoot, extName, ext, options, lang, i18n, i18nm) => {
  switch (extName) {
    case 'liquid': {
      return new Liquid({ ...options, root: siteRoot })
    }
    default:
      throw new Error(i18n.engineNotSupported)
  }
}

export default build
