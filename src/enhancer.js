/** Global enhancer
 * @param {Object} fastify - fastify instance
 * @param {Object} config - global config
 * @param {string} config.duositeRoot - duosite root
 * @param {Object} config.duositeSettings - duosite settings
 * @param {Object} config.duositeServices - duosite services
 * @param {Object} config.i18nm - duosite i18n messages
 * @param {string} config.lang - duosite lang
 * @param {duositSettings}
 */

const enhance = (fastify, config) => {
  const { duositeRoot, duositeSettings, lang, globalServices, i18nm } = config

  console.log(i18nm.runningGlobalEnhancer)
}

module.exports = enhance
