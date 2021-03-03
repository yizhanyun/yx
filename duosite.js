#!/usr/bin/env node

const isSubdomainValid = require('is-subdomain-valid')

const fs = require('fs-extra')

const shell = require('shelljs')

const path = require('path')
const child_process = require('child_process')

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
  console.log(i18nm.duositeUsage)
  return -1
} else {
  const cwd = __dirname

  if (cmd === 'ls') {
    const sites = getDirectories(path.join(cwd, 'sites')).filter(site =>
      site.startsWith('template-')
    )
    console.log(`\nFound ${sites.length} templates`)
    sites.map(site => {
      console.log(`  ${site}`)
    })
  }
  // set cwd to duosite folder
  // set duosite project root to user's project root
  else if (cmd === 'dev') {
    child_process.spawnSync('yarn dev', {
      cwd,
      cmd: process.cmd,
      env: { ...process.env, DUOSITE_ROOT },
    })
    // shell.exec('yarn dev', {
    //   cwd,
    //   cmd: process.cmd,
    //   env: { ...process.env, DUOSITE_ROOT },
    // })
  } else if (cmd === 'new') {
    const fromTemplate = process.argv[3]
    const toSite = process.argv[4]
    if (!fromTemplate || !toSite) {
      console.log(i18nm.duositeNewUsage)
      return -1
    }

    if (!fromTemplate.startsWith('template-')) {
      console.log(i18nm.duositeWrongTemplateName)
      return -1
    }

    const subsites = fs
      .readdirSync(`${__dirname}/sites`, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    const exist = subsites.find(name => name === fromTemplate)

    if (!exist) {
      console.log(i18nm.duositeTemplateNotFound)
      return -1
    }

    if (!isSubdomainValid(toSite)) {
      console.log(i18nm.duositeSubdomainError)
      return -1
    }

    if (subsites.find(name => name === toSite)) {
      console.log(i18nm.duositeNewSiteExists)
      return -1
    }
    fs.mkdirpSync(`${DUOSITE_ROOT}/sites/${toSite}`)

    const cp = fs.copySync(
      `${__dirname}/sites/${fromTemplate}`,
      `${DUOSITE_ROOT}/sites/${toSite}`
    )

    console.log(i18nm.createNewSiteDone(toSite))
  } else console.log(i18nm.productionNotReady)
}
