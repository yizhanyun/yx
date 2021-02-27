const { readdirSync } = require('fs')

// Get directories of a directory
const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

// get subsite
const getSubsite = (host, defaultSite) => {
  const segments = host.split('.')
  return segments.length > 1 ? segments[0] : defaultSite
}

module.exports = {
  getDirectories,
  getSubsite,
}
