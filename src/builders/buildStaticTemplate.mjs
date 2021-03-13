import fs from 'fs-extra'

import path from 'path'

import chalk from 'chalk'

import { removeSuffix } from '../utils.mjs'

import {
  bootTemplateProps,
  bootTemplateStaticPaths,
  serveTemplate,
  buildToFile,
} from '../templateRunner.mjs'

const buildStaticTemplate = async (routeTable, root, site, _duosite) => {
  const [, , file] = routeTable

  const {
    site: { root: siteRoot, engine },
    global,
  } = _duosite

  const i18nm = global.i18nMessages

  console.log(chalk.blue(i18nm.info), i18nm.buildStaticTemplate(file))

  const { staticProps } = await bootTemplateProps({
    file,
    _duosite,
    whichOnes: ['static'],
  })

  await buildToFile({
    outputFileName: removeSuffix(file),
    file,
    _duosite,
    booted: staticProps,
  })
}

export default buildStaticTemplate
