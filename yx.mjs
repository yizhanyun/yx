#!/usr/bin/env node

import chalk from 'chalk'

import isSubdomainValid from 'is-subdomain-valid'

import fs from 'fs-extra'
import path from 'path'
import { readFile } from 'fs/promises'
import child_process from 'child_process'
import templates from './.templates.mjs'

import {
  getDirectories,
  loadGlobalSettings,
  loadGlobalI18NMessages,
} from './src/utils.mjs'

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
  const cwd = __dirname

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
        for (const site of subsites) {
          await bootServer({
            build: true,
            env: 'production',
            buildTarget: site,
          })
        }
      }
    } else bootServer({ build: true, env: 'production', buildTarget: target })
  } else if (cmd === 'dev') {
    // set cwd to yx folder
    // set yx project root to user's project root

    bootServer({ root: YX_ROOT })
  } else if (cmd === 'new') {
    const fromTemplate = process.argv[3]
    const toSite = process.argv[4]
    if (!fromTemplate || !toSite) {
      console.log(chalk.yellow(i18nm.warning), i18nm.yxNewUsage)
      process.exit(-1)
    }

    if (
      !fromTemplate.startsWith('template-') &&
      !fromTemplate.startsWith('https')
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

    const cmd = 'git'
    const args = (fromTemplate.startsWith('template-')
      ? `clone https://github.com/yizhanyun/${fromTemplate} sites/${toSite}`
      : `clone ${fromTemplate} sites/${toSite}`
    ).split(' ')

    console.log(chalk.blue(i18nm.info), i18nm.createNewSiteStart(toSite))

    const result = child_process.spawnSync(cmd, args, {
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

        child_process.spawnSync('yarn', {
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
  } else {
    bootServer({ root: YX_ROOT, env: 'production' })
  }
}
