#!/usr/bin/env node

import chalk from 'chalk'

import isSubdomainValid from 'is-subdomain-valid'

import fs from 'fs-extra'

import path from 'path'

import {
  getDirectories,
  loadGlobalSettings,
  loadGlobalI18NMessages,
} from './src/utils.mjs'

import bootServer from './src/bootServer.mjs'

import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DUOSITE_ROOT = process.cwd()

const settings = await loadGlobalSettings(DUOSITE_ROOT)

const i18nm = await loadGlobalI18NMessages(__dirname, settings.lang)

const cmd = process.argv[2]

if (
  cmd !== 'prod' &&
  cmd !== 'dev' &&
  cmd !== 'new' &&
  cmd !== 'ls' &&
  cmd !== 'build'
) {
  console.warn(chalk.yellow(i18nm.duositeUsage))
  process.exit(-1)
} else {
  const cwd = __dirname

  if (cmd === 'ls') {
    const sites = getDirectories(path.join(cwd, 'sites')).filter(site =>
      site.startsWith('template-')
    )
    console.log(chalk.blue(i18nm.info), i18nm.foundHowManySites(sites.length))
    sites.forEach(site => {
      console.log(`  ${site}`)
    })
  } else if (cmd === 'build') {
    const target = process.argv[3]

    bootServer({ build: true, env: 'production', buildTarget: target })
  } else if (cmd === 'dev') {
    // set cwd to duosite folder
    // set duosite project root to user's project root

    bootServer({ root: DUOSITE_ROOT })
  } else if (cmd === 'new') {
    const fromTemplate = process.argv[3]
    const toSite = process.argv[4]
    if (!fromTemplate || !toSite) {
      console.log(chalk.yellow(i18nm.warning), i18nm.duositeNewUsage)
      process.exit(-1)
    }

    if (!fromTemplate.startsWith('template-')) {
      console.log(chalk.yellow(i18nm.warning), i18nm.duositeWrongTemplateName)
      process.exit(-1)
    }

    const subsites = fs
      .readdirSync(path.join(__dirname, 'sites'), { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    const exist = subsites.find(name => name === fromTemplate)

    if (!exist) {
      console.log(chalk.yellow(i18nm.warning), i18nm.duositeTemplateNotFound)
      process.exit(-1)
    }

    if (!isSubdomainValid(toSite)) {
      console.log(chalk.yellow(i18nm.warning), i18nm.duositeSubdomainError)
      process.exit(-1)
    }

    if (subsites.find(name => name === toSite)) {
      console.log(chalk.yellow(i18nm.warning), i18nm.duositeNewSiteExists)
      process.exit(-1)
    }
    fs.mkdirpSync(path.join(DUOSITE_ROOT, 'sites', toSite))

    const target = path.join(DUOSITE_ROOT, 'sites', toSite)
    try {
      fs.copySync(path.join(cwd, 'sites', fromTemplate), target)
    } catch (e) {
      // console.log(e)
    }

    console.log(chalk.blue(i18nm.info), i18nm.createNewSiteDone(toSite))
  } else {
    bootServer({ root: DUOSITE_ROOT, env: 'production' })
  }
}
