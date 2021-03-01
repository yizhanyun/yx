// Global enhancer

const enhance = (
  fastify,
  duositeRoot,
  duositeSettings,
  globalServices,
  i18nm
) => {
  console.log(i18nm.runningGlobalEnhancer)
}

module.exports = enhance
