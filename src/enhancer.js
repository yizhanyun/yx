/** Global enhancer
 * @param {Object} fastify - fastify instance
 * @param {Object} settings - duosite settings
 * @param {Object} duositeConfig - config generated to be passed down, including globalservices
 * @param {duositSettings}
 */

const enhance = (fastify, settings, duositeConfig) => {
  const {
    global: { i18nMessages: i18nm },
  } = duositeConfig
  console.log(i18nm.runningGlobalEnhancer)
}

module.exports = enhance
