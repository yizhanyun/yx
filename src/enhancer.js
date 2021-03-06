/** Global enhancer
 * @param {Object} fastify - fastify instance
 * @param {Object} settings - duosite settings
 * @param {Object} duositeConfig - config generated to be passed down, including globalservices
 * @param {duositSettings}
 */

const enhance = async (fastify, settings, duositeConfig) => {
  const {
    global: { i18nMessages: i18nm },
  } = duositeConfig
  console.log(i18nm.runningGlobalEnhancer)
}

export default enhance
