import fs from 'fs-extra'

import path from 'path'

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

  const { staticPaths, fallback } = bootTemplateProps({
    file,
    _duosite,
    whichOnes: ['paths'],
  })

  if (staticPaths) {
    for (const staticPath of staticPaths) {
      const { params } = staticPath
      const outputFileName = buildGeneratedFileName(table, params)
      const { staticProps: booted } = await bootTemplateProps({
        _duosite,
        params,
        whichOnes: ['static'],
      })

      console.log('-------------', booted)

      if (booted) {
        if (engine.renderToFileAsync) {
          try {
            const outputHtmlPath = path.join(
              siteRoot,
              '.production',
              'pages',
              outputFileName + '.html'
            )
            await engine.renderToFileAsync(
              file,
              {
                ...booted,
                _ctx: { _duosite },
              },
              outputHtmlPath
            )
            console.log(chalk.green(i18nm.writeBuildFile(outputHtmlPath)))
          } catch (e) {
            console.log(e)
          }
        } else if (engine.renderToFile) {
          try {
            const outputHtmlPath = path.join(
              siteRoot,
              '.production',
              'pages',
              outputFileName + '.html'
            )
            engine.renderToFile(
              file,
              {
                ...booted,
                _ctx: { _duosite },
              },
              outputHtmlPath
            )
            console.log(chalk.green(i18nm.writeBuildFile(outputHtmlPath)))
          } catch (e) {
            console.log(e)
          }
        } else {
          const output = await engine.renderFile(file, {
            ...booted,
            _ctx: { _duosite },
          })

          try {
            const outputHtmlPath = path.join(
              siteRoot,
              '.production',
              'pages',
              outputFileName + '.html'
            )
            await fs.outputFile(outputHtmlPath, output)
            console.log(chalk.green(i18nm.writeBuildFile(outputHtmlPath)))
          } catch (e) {
            console.log(e)
          }
        }
      }
    }
  }
  // let booted
  // let bootJs
  // try {
  //   bootJs = await import(path.join(siteRoot, 'pages', file + '.boot.mjs'))
  // } catch (e) {
  //   // console.log(e)
  // }

  // let paths, fallback

  // if (bootJs && !bootJs.getServerProps && bootJs.getStaticPaths) {
  //   const pathsGot = (await bootJs.getStaticPaths({ _duosite })) || {}
  //   paths = pathsGot.paths
  //   fallback = pathsGot.fallback
  // }

  // if (paths && bootJs.getStaticProps) {
  //   for (const staticPath of paths) {
  //     const { params } = staticPath
  //     const outputFileName = buildGeneratedFileName(table, params)
  //     booted = await bootJs.getStaticProps({ _duosite, params })

  //     console.log('-------------', booted)

  //     if (bootJs && bootJs.getStaticProps) {
  //       if (engine.renderToFileAsync) {
  //         try {
  //           const outputHtmlPath = path.join(
  //             siteRoot,
  //             'pages',
  //             outputFileName + '.html'
  //           )
  //           await engine.renderToFileAsync(
  //             file,
  //             {
  //               ...booted,
  //               _ctx: { _duosite },
  //             },
  //             outputHtmlPath
  //           )
  //           console.log(chalk.green(i18nm.writeBuildFile(outputHtmlPath)))
  //         } catch (e) {
  //           console.log(e)
  //         }
  //       } else if (engine.renderToFile) {
  //         try {
  //           const outputHtmlPath = path.join(
  //             siteRoot,
  //             'pages',
  //             outputFileName + '.html'
  //           )
  //           engine.renderToFile(
  //             file,
  //             {
  //               ...booted,
  //               _ctx: { _duosite },
  //             },
  //             outputHtmlPath
  //           )
  //           console.log(chalk.green(i18nm.writeBuildFile(outputHtmlPath)))
  //         } catch (e) {
  //           console.log(e)
  //         }
  //       } else {
  //         const output = await engine.renderFile(file, {
  //           ...booted,
  //           _ctx: { _duosite },
  //         })

  //         try {
  //           const outputHtmlPath = path.join(
  //             siteRoot,
  //             'pages',
  //             outputFileName + '.html'
  //           )
  //           await fs.outputFile(outputHtmlPath, output)
  //           console.log(chalk.green(i18nm.writeBuildFile(outputHtmlPath)))
  //         } catch (e) {
  //           console.log(e)
  //         }
  //       }
  //     }
  //   }
  // }

  let bootJs
  try {
    bootJs = await import(path.join(siteRoot, 'pages', file + '.boot.mjs'))
  } catch (e) {
    // console.log(e)
  }

  if (!bootJs || bootJs.getServerProps || fallback) {
    const filesForCopy = [file, file + '.boot.mjs']

    filesForCopy.forEach(file => {
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
