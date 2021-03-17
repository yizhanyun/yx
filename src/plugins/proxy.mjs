import path from 'path'

import { genericGetRoute } from './getHandler.mjs'

const siteRootName = 'sites'

const isProduction = process.env.NODE_ENV === 'production'

//  Plugin to handle each subsite's request

// opts: { prefix, _duosite: { siteRoot }}

const buildProxyPlugin = async (buildSite, target) => {
  const subsite = async function (fastify, opts, done) {
    const { _duosite, prefix: site, siteSettings: settings } = opts

    // do nothing if building but not self
    if (buildSite && target !== '*' && target !== site) return

    const { global } = _duosite

    const { root } = global

    const siteRoot = path.join(
      root,
      siteRootName,
      site,
      isProduction && !buildSite ? '.production' : ''
    )

    const duositeConfig = {
      ..._duosite,
      site: {
        root: siteRoot,
        settings,
        prodRoot: path.join('.production', siteRoot),
        name: site,
      },
    }

    // enhance request with _duosite

    fastify.addHook('preHandler', (request, reply, done) => {
      request._duosite = {
        ...duositeConfig,
        url:
          request.url[0] === '/'
            ? request.url.replace('/' + site, '')
            : request.url.replace(site, ''),
      }
      done()
    })

    fastify.route(genericGetRoute)

    done()
  }

  return subsite
}

export default buildProxyPlugin
