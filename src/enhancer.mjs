import chalk from 'chalk'

/** Global enhancer
 * @param {Object} fastify - fastify instance
 * @param {Object} settings - yxt settings
 * @param {Object} yxConfig - config generated to be passed down, including globalservices
 * @param {duositSettings}
 */

const enhance = async (fastify, settings, yxConfig) => {
  const {
    global: { i18nMessages: i18nm },
  } = yxConfig
  console.log(chalk.blue(i18nm.info), i18nm.runningGlobalEnhancer)
}

export default enhance
