import path from 'path'

import fastifyMarko from '@marko/fastify'
import lasso from 'lasso'

const isProduction = process.env.NODE_ENV === 'production'

const enhance = async (fastify, _yx) => {
  fastify.register(fastifyMarko)

  const {
    site: { root, name },
  } = _yx

  const outputDir = path.join(root, 'public', 'bundle')

  fastify.addHook('preHandler', (request, reply, done) => {
    try {
      lasso.configure({
        plugins: [
          'lasso-marko', // Allow Marko templates to be compiled and transported to the browser
        ],
        urlPrefix: '/bundle',
        outputDir, // Place all generated JS/CSS/etc. files into the "static" dir
        minify: isProduction, // Only minify JS and CSS code in production
        bundlingEnabled: isProduction, // Only enable bundling in production
        fingerprintsEnabled: isProduction, // Only add fingerprints to URLs in production
      })
    } catch (e) {
      // console.log(e)
    }
    done()
  })
}

export default enhance
