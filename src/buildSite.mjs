// Default build site
import rimraf from 'rimraf'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'

import buildHtml from './builders/buildHtml.mjs'
import buildStaticTemplate from './builders/buildStaticTemplate.mjs'
import buildCatchTemplate from './builders/buildCatchTemplate.mjs'

const build = async (root, site, _duosite, fileRoutingTable) => {
  const { global, site: siteConfig = {} } = _duosite

  const { settings: globalSettings, i18nMessages: i18nm, lang } = global
  const { settings: siteSettings = {} } = siteConfig
  const { viewEngine = {} } = siteSettings

  console.log(chalk.blue(i18nm.startBuildingSite(site)))
  console.log(chalk.blue(i18nm.cleanPreviousBuild))
  rimraf.sync(path.join(root, '.production'))
  fs.mkdirpSync(path.join(root, '.production'))

  console.log(chalk.blue(i18nm.copySettings))
  const filesForCopy = ['settings.mjs', 'settings.production.mjs']

  filesForCopy.forEach(file => {
    const target = path.join(root, '.production', file)
    try {
      fs.copySync(path.join(root, file), target)
    } catch (e) {
      // console.log(e)
    }
  })

  const foldersForCopy = ['src', 'api', ['public', 'static']]
  foldersForCopy.forEach(folder => {
    const _folder = Array.isArray(folder) ? path.join(...folder) : folder

    const target = path.join(root, '.production', _folder)
    fs.mkdirpSync(target)
    console.log(chalk.blue(i18nm.copyFolder(_folder)))
    const source = path.join(root, _folder)
    if (fs.pathExistsSync(source)) {
      try {
        fs.copySync(source, target)
      } catch (e) {
        console.log(e)
      }
    }
  })

  for (const table of fileRoutingTable) {
    const [type, segments, file] = table
    if (type === 'static') {
      if (file.endsWith('.html')) {
        console.log('built html')
        await buildHtml(table, root, site, _duosite)
      } else if (viewEngine.ext && file.endsWith(viewEngine.ext)) {
        await buildStaticTemplate(table, root, site, _duosite)
      }
    } else await buildCatchTemplate(table, root, site, _duosite)
  }
}
export { build }
