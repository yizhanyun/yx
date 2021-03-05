const path = require('path')

const root = process.env.DUOSITE_ROOT || process.cwd()

const {
  getDirectories,
  getSubsite,
  loadGlobalSettings,
  loadGlobalI18NMessages,
} = require('./src/utils')

const build = async root => {
  const settings = loadGlobalSettings(root)

  // const

  // root of user project

  // loading sites list and config

  const sites = getDirectories(path.join(root, siteRootName))

  let build = {}

  let defaultBuild = {}

  try {
    build = require('./src/build.js')
  } catch (e) {}

  try {
    build = require(path.join(root, 'src', build.js))
  } catch (e) {}

  if (build.prebuildGlobal) {
    await build.prebuildGlobal(root, settings)
  } else if (defaultBuild.prebuild) {
    await defaultBuild.prebuildGlobal(root, settings)
  }

  if (build.buildGlobal) {
    await build.buildGlobal(root, settings)
  } else if (defaultBuild.buildGlobal) {
    await defaultBuild.buildGlobal(root, settings)
  }

  if (build.postbuildGlobal) {
    await build.postbuildGlobal(root, settings)
  } else if (defaultBuild.postbuild) {
    await defaultBuild.postbuildGlobal(root, settings)
  }
}

module.exports = build
