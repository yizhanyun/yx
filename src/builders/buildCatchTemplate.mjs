import fs from 'fs-extra'

import path from 'path'
import { pathToFileURL } from 'url'

import chalk from 'chalk'

import { buildGeneratedFileName } from '../utils.mjs'
import { bootTemplateProps } from '../templateRunner.mjs'

const buildCatchTemplate = async (routeTable, root, site, _duosite) => {
  const [, table, file] = routeTable

  const {
    site: { root: siteRoot, engine },
    global,
  } = _duosite

  const i18nm = global.i18nMessages

  const { staticPaths, fallback } = await bootTemplateProps({
    file,
    _duosite,
    whichOnes: ['paths'],
  })

  if (staticPaths) {
    for (const staticPath of staticPaths) {
      const { params } = staticPath
      const outputFileName = buildGeneratedFileName(table, params)
      const { staticProps: booted } = await bootTemplateProps({
        file,
        _duosite,
        params,
        whichOnes: ['static'],
      })

      if (booted) {
        if (engine.renderToFileAsync) {
          try {
            const outputHtmlPath = path.join(
              siteRoot,
              '.production',
              'pages',
              outputFileName + '.html'
            )
            console.log(chalk.blue(i18nm.info), i18nm.buildStaticRender(file))

            await engine.renderToFileAsync(
              path.join('pages', file),
              {
                ...booted,
                _ctx: { _duosite },
              },
              outputHtmlPath
            )
            console.log(
              chalk.blue(i18nm.info),
              i18nm.writeBuildFile(outputHtmlPath)
            )
          } catch (e) {
            // console.log(e)
          }
        } else if (engine.renderToFile) {
          try {
            const outputHtmlPath = path.join(
              siteRoot,
              '.production',
              'pages',
              outputFileName + '.html'
            )
            console.log(chalk.blue(i18nm.info), i18nm.buildStaticRender(file))
            engine.renderToFile(
              path.join('pages', file),
              {
                ...booted,
                _ctx: { _duosite },
              },
              outputHtmlPath
            )
            console.log(
              chalk.blue(i18nm.info),
              i18nm.writeBuildFile(outputHtmlPath)
            )
          } catch (e) {
            // console.log(e)
          }
        } else {
          const output = await engine.renderFile(path.join('pages', file), {
            ...booted,
            _ctx: { _duosite },
          })

          try {
            console.log(chalk.blue(i18nm.info), i18nm.buildStaticRender(file))
            const outputHtmlPath = path.join(
              siteRoot,
              '.production',
              'pages',
              outputFileName + '.html'
            )
            await fs.outputFile(outputHtmlPath, output)
            console.log(
              chalk.blue(i18nm.info),
              i18nm.writeBuildFile(outputHtmlPath)
            )
          } catch (e) {
            // console.log(e)
          }
        }
      }
    }
  }

  let bootJs
  try {
    bootJs = await import(
      pathToFileURL(path.join(siteRoot, 'pages', file + '.boot.mjs'))
    )
  } catch (e) {
    // console.log(e)
  }

  if (!bootJs || bootJs.getServerProps || fallback) {
    const filesForCopy = [file, file + '.boot.mjs']

    filesForCopy.forEach(file => {
      console.log(chalk.blue(i18nm.info), i18nm.buildServerSideRender(file))
      const target = path.join(siteRoot, '.production', 'pages', file)
      try {
        fs.copySync(path.join(siteRoot, 'pages', file), target)
      } catch (e) {
        // console.log(e)
      }
    })
  }
}

export default buildCatchTemplate
