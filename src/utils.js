const { readdirSync } = require('fs')

// Get directories of a directory
const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

module.exports = {
  getDirectories,
}
