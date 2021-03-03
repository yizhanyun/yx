// Basic get handler
const path = require('path')

const { resolveUrlToFile } = require('../utils')

const genericGetHandler = async function (request, reply) {
  const { _duosite } = request

  const {
    site: { root: siteRoot, engine, settings = {} },
  } = _duosite

  console.log('_duosite is >>>>>>>>>>>>>>>', _duosite)
  const { viewEngine = {} } = settings

  const { ext } = viewEngine

  const url = request.params['*']
  const r = await resolveUrlToFile(siteRoot, url, viewEngine)
  if (!r) {
    reply.statusCode = 404
    reply.send()
    return reply
  } else {
    const [file, resovledExt] = r

    if (ext === resovledExt) {
      let booted
      let bootJs
      try {
        bootJs = require(path.join(siteRoot, file + '.boot.js'))
      } catch (e) {
        console.log(e)
      }

      if (bootJs && bootJs.getServerProps) {
        booted = await bootJs.getServerProps({ request, reply })
      }

      const output = await engine.renderFile(file, {
        ...booted,
        _ctx: { request, reply },
      })
      reply.headers({ 'Content-Type': 'text/html' })
      reply.send(output)
      return reply
    } else {
      reply.sendFile(file, siteRoot)
      return reply
    }
  }
}

const genericGetRoute = {
  method: 'GET',
  url: '*',
  handler: genericGetHandler,
}

module.exports = {
  genericGetRoute,
}
