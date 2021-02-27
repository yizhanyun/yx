// Basic get handler
const { resolveUrlToFile } = require('../utils')
const path = require('path')

const getHandler = {
  method: 'GET',
  url: '*',
  handler: async function (request, reply) {
    const { _duosite } = request
    const { siteRoot, viewEngine = {} } = _duosite

    const { name, ext, options } = viewEngine

    const url = request.params['*']
    const r = await resolveUrlToFile(siteRoot, url, viewEngine)
    if (!r) {
      reply.send({
        hello: 'NOT resolved from generic handler',
        param: request.params,
        _duosite,
        url,
      })
      return reply
    } else {
      const [file] = r
      const segs = file.split('/')

      const fileName = segs.pop()
      console.log(fileName, path.join(...segs))
      reply.sendFile(fileName, path.join('/', ...segs))
      // reply.send(path)
      // reply.sendFile(file, '')
      return reply
    }
  },
}

module.exports = getHandler
