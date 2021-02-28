#!/usr/bin/env node

const isSubdomainValid = require('is-subdomain-valid')

const fs = require('fs-extra')

const shell = require('shelljs')
console.log('>>>>>', process.argv)
const cmd = process.argv[2]

if (cmd !== 'prod' && cmd !== 'dev' && cmd !== 'new') {
  console.log(
    'Wrong argument. \nUsage:\nduosite dev - run devevelopment\nduosite prod = run production\nduosite new - create new site from template'
  )
  return -1
} else {
  const DUOSITE_ROOT = process.cwd()

  const cwd = __dirname

  // set cwd to duosite folder
  // set duosite project root to user's project root
  if (cmd === 'dev') {
    shell.exec('yarn dev', {
      cwd,
      cmd: { ...process.cmd, DUOSITE_ROOT },
    })
  } else if (cmd === 'new') {
    const fromTemplate = process.argv[3]
    const toSite = process.argv[4]
    if (!fromTemplate || !toSite) {
      console.log('Usage: duosite new <template-name> <new-site-name>')
      return -1
    }

    if (!fromTemplate.startsWith('template-')) {
      console.log('Wrong template name')
      return -1
    }

    const subsites = fs
      .readdirSync(`${__dirname}/sites`, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    const exist = subsites.find(name => name === fromTemplate)

    if (!exist) {
      console.log('Template not found')
      return -1
    }

    if (!isSubdomainValid(toSite)) {
      console.log('New site name not legal subdomain name')
      return -1
    }

    if (subsites.find(name => name === toSite)) {
      console.log('New site exists')
      return -1
    }
    fs.mkdirpSync(`${DUOSITE_ROOT}/sites/${toSite}`)

    const cp = fs.copySync(
      `${__dirname}/sites/${fromTemplate}`,
      `${DUOSITE_ROOT}/sites/${toSite}`
    )

    console.log(`Create new site ${toSite} done`)
  } else console.log('Production build is not released yet')
}
