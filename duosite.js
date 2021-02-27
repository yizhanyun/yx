#!/usr/bin/env node

const shell = require('shelljs')
console.log('>>>>>', process.argv)
const env = process.argv[2]

if (env !== 'prod' && env !== 'dev') {
  console.log('Wrong argument. \nPlease run duosite with dev or duosite prod')
  return
}

const DUOSITE_ROOT = process.cwd()

const cwd = __dirname

// set cwd to duosite folder
// set duosite project root to user's project root
if (env === 'dev')
  shell.exec('yarn dev', {
    cwd,
    env: { ...process.env, DUOSITE_ROOT },
  })
