#!/usr/bin/env node

const shell = require('shelljs')

const env = process.argv[2]

if (env !== 'prod' && env !== 'dev') {
  console.log('Wrong argument. \nPlease run duosite with dev or duosite prod')
  return
}
if (env === 'dev') shell.exec('yarn dev')
