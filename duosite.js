#!/usr/bin/env node

const chalk = require('chalk')

const isSubdomainValid = require('is-subdomain-valid')

const fs = require('fs-extra')

const path = require('path')

const childProcess = require('child_process')

const {
  getDirectories,
  loadGlobalSettings,
  loadGlobalI18NMessages,
} = require('./src/utils')

const DUOSITE_ROOT = process.cwd()

const settings = loadGlobalSettings(DUOSITE_ROOT)

const i18nm = loadGlobalI18NMessages(__dirname, settings.lang)

const cmd = process.argv[2]

if (cmd !== 'prod' && cmd !== 'dev' && cmd !== 'new' && cmd !== 'ls') {
  console.warn(chalk.yellow(i18nm.duositeUsage))
  return -1
} else {
  const cwd = __dirname

  if (cmd === 'ls') {
    const sites = getDirectories(path.join(cwd, 'sites')).filter(site =>
      site.startsWith('template-')
    )
    console.log(chalk.green(`\nFound ${sites.length} templates`))
    sites.map(site => {
      console.log(chalk.green(`  ${site}`))
    })
  }
  // set cwd to duosite folder
  // set duosite project root to user's project root
  else if (cmd === 'dev') {
    const bootServer = require('./bootServer')
    bootServer({ root: DUOSITE_ROOT })
  } else if (cmd === 'new') {
    const fromTemplate = process.argv[3]
    const toSite = process.argv[4]
    if (!fromTemplate || !toSite) {
      console.log(chalk.yellow(i18nm.duositeNewUsage))
      return -1
    }

    if (!fromTemplate.startsWith('template-')) {
      console.log(chalk.yellow(i18nm.duositeWrongTemplateName))
      return -1
    }

    const subsites = fs
      .readdirSync(`${__dirname}/sites`, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    const exist = subsites.find(name => name === fromTemplate)

    if (!exist) {
      console.log(chalk.yellow(i18nm.duositeTemplateNotFound))
      return -1
    }

    if (!isSubdomainValid(toSite)) {
      console.log(chalk.yellow(i18nm.duositeSubdomainError))
      return -1
    }

    if (subsites.find(name => name === toSite)) {
      console.log(chalk.yellow(i18nm.duositeNewSiteExists))
      return -1
    }
    fs.mkdirpSync(`${DUOSITE_ROOT}/sites/${toSite}`)

    const cp = fs.copySync(
      `${__dirname}/sites/${fromTemplate}`,
      `${DUOSITE_ROOT}/sites/${toSite}`
    )

    console.log(chalk.blue(i18nm.createNewSiteDone(toSite)))
  } else {
    const bootServer = require('./bootServer')
    bootServer({ root: DUOSITE_ROOT, env: 'production' })

    // console.log(chalk.yellow(i18nm.productionNotReady))
  }
}
