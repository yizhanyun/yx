#!/usr/bin/env node

import chalk from 'chalk'

import isSubdomainValid from 'is-subdomain-valid'

import fs from 'fs-extra'
import path from 'path'
import childProcess from 'child_process'
import Downloader from 'nodejs-file-downloader'
import anzip from 'anzip'
import ora from 'ora'
import templates from './.templates.mjs'

import { loadGlobalSettings, loadGlobalI18NMessages } from './src/utils.mjs'

import bootServer from './src/bootServer.mjs'

import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const YX_ROOT = process.cwd()

const settings = await loadGlobalSettings(YX_ROOT)

const i18nm = await loadGlobalI18NMessages(__dirname, settings.lang)

const cmd = process.argv[2]
if (
  cmd !== 'prod' &&
  cmd !== 'dev' &&
  cmd !== 'new' &&
  cmd !== 'ls' &&
  cmd !== 'build'
) {
  console.warn(chalk.yellow(i18nm.yxUsage))
  process.exit(-1)
} else {
  if (cmd === 'ls') {
    const { official: sites } = templates
    console.log(chalk.blue(i18nm.info), i18nm.foundHowManySites(sites.length))
    sites.forEach(site => {
      console.log(`  ${site}`)
    })
  } else if (cmd === 'build') {
    const target = process.argv[3]

    console.log(cmd, target)

    if (!target) {
      console.warn(chalk.yellow(i18nm.yxUsage))
      process.exit(-1)
    }
    if (target === 'all') {
      const subsites = fs
        .readdirSync(path.join(YX_ROOT, 'sites'), { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

      if (!subsites || subsites.length === 0) {
        console.warn(chalk.yellow(i18nm.siteNotFound))
        process.exit(-1)
      } else {
        const forBuilding = subsites.reverse()

        const first = forBuilding.pop()

        const onBuildDone = () => {
          const target = forBuilding.pop()
          if (target) {
            bootServer({
              build: true,
              env: 'production',
              buildTarget: target,
              onBuildDone,
            })
          }
        }
        // for (const site of subsites) {
        await bootServer({
          build: true,
          env: 'production',
          buildTarget: first,
          onBuildDone,
        })
        // }
      }
    } else bootServer({ build: true, env: 'production', buildTarget: target })
  } else if (cmd === 'dev') {
    // set cwd to yx folder
    // set yx project root to user's project root

    bootServer({ root: YX_ROOT })
  } else if (cmd === 'new') {
    const fromTemplate = process.argv[3]
    const toSite = process.argv[4]
      ? process.argv[4]
      : fromTemplate && fromTemplate.startsWith('xyz-')
      ? fromTemplate
      : ''
    if (!fromTemplate || !toSite) {
      console.log(chalk.yellow(i18nm.warning), i18nm.yxNewUsage)
      process.exit(-1)
    }

    if (
      !fromTemplate.startsWith('template-') &&
      !fromTemplate.startsWith('https') &&
      !fromTemplate.startsWith('xyz-')
    ) {
      console.log(chalk.yellow(i18nm.warning), i18nm.yxWrongTemplateName)
      process.exit(-1)
    }

    fs.ensureDirSync(path.join(YX_ROOT, 'sites'))
    const subsites = fs
      .readdirSync(path.join(YX_ROOT, 'sites'), { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    if (!isSubdomainValid(toSite)) {
      console.log(chalk.yellow(i18nm.warning), i18nm.yxSubdomainError)
      process.exit(-1)
    }

    if (subsites.find(name => name === toSite)) {
      console.log(chalk.yellow(i18nm.warning), i18nm.yxNewSiteExists)
      process.exit(-1)
    }
    fs.mkdirpSync(path.join(YX_ROOT, 'sites'))

    const target = path.join(YX_ROOT, 'sites', toSite)

    if (fromTemplate.startsWith('xyz-')) {
      console.log(chalk.blue(i18nm.info), i18nm.createNewSiteStart(toSite))
      const url = `https://x-public.yizhanyun.cn/free/template/source/${fromTemplate}/latest.zip`

      const download = async () => {
        //Wrapping the code with an async function, just for the sake of example.

        const spinner = ora(i18nm.download).start()
        const downloader = new Downloader({
          url, //If the file name already exists, a new file with the name 200MB1.zip is created.
          directory: path.join(YX_ROOT, 'sites'), //This folder will be created, if it doesn't exist.
          fileName: toSite + '.zip',
          // onProgress: percentage => {
          //   //Gets called with each chunk.
          //   console.log('% ', percentage)
          // },
        })
        try {
          await downloader.download() //Downloader.download() returns a promise.
          const downloaded = path.join(YX_ROOT, 'sites', toSite + '.zip')

          await anzip(downloaded, {
            outputPath: path.join(YX_ROOT, 'sites', toSite),
          })
          spinner.stop()
          fs.removeSync(downloaded)
          try {
            const sitePackage = JSON.parse(
              fs.readFileSync(path.join(target, 'package.json'), 'utf8')
            )
            sitePackage.name = toSite
            fs.writeFileSync(
              path.join(target, 'package.json'),
              JSON.stringify(sitePackage, null, 2)
            )

            fs.removeSync(path.join(target, '.git'))

            console.log(chalk.blue(i18nm.info), i18nm.installYarnPackages)
            console.log(chalk.blue(i18nm.info), i18nm.runSthStart)
            console.log('')

            childProcess.spawnSync('yarn', {
              cwd: target,
              stdio: 'inherit',
            })

            console.log('')
            console.log(chalk.blue(i18nm.info), i18nm.createNewSiteDone(toSite))
            console.log(chalk.blue(i18nm.info), i18nm.runSthEnd)
          } catch (e) {
            console.log(e)
          }
        } catch (error) {
          //IMPORTANT: Handle a possible error. An error is thrown in case of network errors, or status codes of 400 and above.
          //Note that if the maxAttempts is set to higher than 1, the error is thrown only if all attempts fail.
          console.log(error)
          if (error.statusCode === 403)
            console.log(chalk.red(i18nm.error), i18nm.notAllowed)
        }
      }
      await download()
    } else {
      const cmd = 'git'
      const args = (fromTemplate.startsWith('template-')
        ? `clone https://github.com/yizhanyun/${fromTemplate} sites/${toSite}`
        : `clone ${fromTemplate} sites/${toSite}`
      ).split(' ')

      console.log(chalk.blue(i18nm.info), i18nm.createNewSiteStart(toSite))

      const result = childProcess.spawnSync(cmd, args, {
        cwd: YX_ROOT,
        stdio: 'inherit',
      })

      if (result.status) {
        console.log(
          chalk.yellow(i18nm.warning),
          i18nm.createNewSiteFailed(toSite)
        )
        process.exit(-1)
      } else {
        try {
          const sitePackage = JSON.parse(
            fs.readFileSync(path.join(target, 'package.json'), 'utf8')
          )
          sitePackage.name = toSite
          fs.writeFileSync(
            path.join(target, 'package.json'),
            JSON.stringify(sitePackage, null, 2)
          )

          fs.removeSync(path.join(target, '.git'))

          console.log(chalk.blue(i18nm.info), i18nm.installYarnPackages)
          console.log(chalk.blue(i18nm.info), i18nm.runSthStart)
          console.log('')

          childProcess.spawnSync('yarn', {
            cwd: target,
            stdio: 'inherit',
          })

          console.log('')
          console.log(chalk.blue(i18nm.info), i18nm.createNewSiteDone(toSite))
          console.log(chalk.blue(i18nm.info), i18nm.runSthEnd)
        } catch (e) {
          console.log(e)
        }
      }
    }
  } else {
    process.env.NODE_ENV = 'production'

    bootServer({ root: YX_ROOT, env: 'production' })
  }
}
