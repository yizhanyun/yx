#!/usr/bin/env node

const { exec } = require('child_process')
const env = process.argv[2]

if (env !== 'prod' && env !== 'dev') {
  console.log('Wrong argument. \nPlease run duosite with dev or duosite prod')
  return
}
if (env === 'dev')
  exec('yarn nodemon ./server.js', (err, stdout, stderr) => {
    if (err) {
      //some err occurred
      console.error(err)
    } else {
      // the *entire* stdout and stderr (buffered)
      console.log(`stdout: ${stdout}`)
    }
  })
