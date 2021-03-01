// Basic get handler
const { resolveUrlToFile } = require('../utils')

const genericGetHandler = async function (request, reply) {
  const { _duosite } = request

  const { siteRoot, settings = {}, engine } = _duosite

  const { viewEngine = {} } = settings

  const { ext } = viewEngine

  const url = request.params['*']
  const r = await resolveUrlToFile(siteRoot, url, viewEngine)
  if (!r) {
    reply.send({
      hello: 'NOT resolved from generic handler',
      param: request.params,
      _duosite,
      url,
      r,
    })
    return reply
  } else {
    const [file, resovledExt] = r

    if (ext === resovledExt) {
      const output = await engine.renderFile(file, {
        text: 'from template engine',
      })
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
