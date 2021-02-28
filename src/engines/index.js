// View engines

const engines = {
  LiquidJS: 'liquid',
}

const buildEngine = (viewEngine, lang) => {
  const { name } = viewEngine
  const i18n = require(`../lang/${lang}`)
  if (!engines[name]) throw new Error(i18n.engineNotSupported)

  return engines[name] // for testing...
  // return require(`./${engines[name]}`).boot(options)
}

module.exports = { buildEngine, engines }
