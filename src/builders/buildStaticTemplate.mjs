import fs from 'fs-extra'

import path from 'path'

import chalk from 'chalk'

import { removeSuffix } from '../utils.mjs'

const buildStaticTemplate = async (routeTable, root, site, _duosite) => {
  console.log('building static template...', routeTable, root, site, _duosite)

  const [, , file] = routeTable

  const {
    site: { root: siteRoot, engine, settings = {} },
    global,
  } = _duosite

  const i18nm = global.i18nMessages

  let booted
  let bootJs
  try {
    bootJs = await import(path.join(siteRoot, 'pages', file + '.boot.mjs'))
  } catch (e) {
    console.log(e)
  }

  if (bootJs && bootJs.getStaticProps) {
    booted = await bootJs.getStaticProps({ _duosite })
  }

  const output = await engine.renderFile(path.join('pages', file), {
    ...booted,
    _ctx: { _duosite },
  })

  try {
    const outputHtmlPath = path.join(
      siteRoot,
      '.production',
      'pages',
      removeSuffix(file) + '.html'
    )
    await fs.outputFile(outputHtmlPath, output)
    console.log(chalk.green(i18nm.writeBuildFile(outputHtmlPath)))
  } catch (e) {
    console.log(e)
  }
}

export default buildStaticTemplate
