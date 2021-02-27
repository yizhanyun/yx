#!/usr/bin/env node

const shell = require('shelljs')
console.log('>>>>>', process.argv)
const env = process.argv[2]

if (env !== 'prod' && env !== 'dev') {
  console.log('Wrong argument. o\nPlease run duosite with dev or duosite prod')
  return
}

const DUOSITE_ROOT = process.cwd()

const cwd = __dirname

if (env === 'dev')
  shell.exec('yarn nodemon ./server.js', {
    cwd,
    env: { ...process.env, DUOSITE_ROOT },
  })
