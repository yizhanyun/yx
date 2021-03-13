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

  console.log(i18nm.buildStaticTemplate(file))

  const { staticProps } = await bootTemplateProps({
    file,
    _duosite,
    whichOnes: ['static'],
  })


  if (staticProps) {
    buildToFile({
      outputFileName: removeSuffix(file),
      file,
      _duosite,
      booted: staticProps,
    })
    // if (engine.renderToFileAsync) {
    //   try {
    //     const outputHtmlPath = path.join(
    //       siteRoot,
    //       'pages',
    //       removeSuffix(file) + '.html'
    //     )
    //     await engine.renderToFileAsync(
    //       file,
    //       {
    //         ...booted,
    //         _ctx: { _duosite },
    //       },
    //       outputHtmlPath
    //     )
    //     console.log(chalk.green(i18nm.writeBuildFile(outputHtmlPath)))
    //   } catch (e) {
    //     console.log(e)
    //   }
    // } else if (engine.renderToFile) {
    //   try {
    //     const outputHtmlPath = path.join(
    //       siteRoot,
    //       'pages',
    //       removeSuffix(file) + '.html'
    //     )
    //     engine.renderToFile(
    //       file,
    //       {
    //         ...booted,
    //         _ctx: { _duosite },
    //       },
    //       outputHtmlPath
    //     )
    //     console.log(chalk.green(i18nm.writeBuildFile(outputHtmlPath)))
    //   } catch (e) {
    //     console.log(e)
    //   }
    // } else {
    //   const output = await engine.renderFile(file, {
    //     ...booted,
    //     _ctx: { _duosite },
    //   })

    //   try {
    //     const outputHtmlPath = path.join(
    //       siteRoot,
    //       'pages',
    //       removeSuffix(file) + '.html'
    //     )
    //     await fs.outputFile(outputHtmlPath, output)
    //     console.log(chalk.green(i18nm.writeBuildFile(outputHtmlPath)))
    //   } catch (e) {
    //     console.log(e)
    //   }
    // }
  }
  // if (engine.renderToFile) {
  //   try {
  //     const outputHtmlPath = path.join(
  //       siteRoot,
  //       '.production',
  //       'pages',
  //       removeSuffix(file) + '.html'
  //     )
  //     await engine.renderToFile(
  //       path.join('pages', file),
  //       {
  //         ...booted,
  //         _ctx: { _duosite },
  //       },
  //       outputHtmlPath
  //     )
  //     console.log(chalk.green(i18nm.writeBuildFile(outputHtmlPath)))
  //   } catch (e) {
  //     console.log(e)
  //   }
  // } else {
  //   const output = await engine.renderFile(path.join('pages', file), {
  //     ...booted,
  //     _ctx: { _duosite },
  //   })

  //   try {
  //     const outputHtmlPath = path.join(
  //       siteRoot,
  //       '.production',
  //       'pages',
  //       removeSuffix(file) + '.html'
  //     )
  //     await fs.outputFile(outputHtmlPath, output)
  //     console.log(chalk.green(i18nm.writeBuildFile(outputHtmlPath)))
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }
}

export default buildStaticTemplate
