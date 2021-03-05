const rimraf = require('rimraf')
const path = require('path')
const fs = require('fs-extra')

const prebuild = (root, _duosite) => {
  // console.log('%%% site prebuild ', root, _duosite)
}

const build = (root, _duosite) => {
  console.log(
    '=============================================Building site',
    root,
    _duosite
  )

  console.log('Clearing .produciton folder')
  rimraf.sync(path.join(root, '.production'))
  fs.mkdirpSync(path.join(root, '.production'))

  const filesForCopy = ['settings.js', 'settings.production.js']

  filesForCopy.forEach(file => {
    const target = path.join(root, '.production', file)
    try {
      fs.copySync(path.join(root, file), target)
    } catch (e) {
      console.log(e)
    }
  })

  const foldersForCopy = ['src', 'api', 'public', 'pages']

  foldersForCopy.forEach(folder => {
    const target = path.join(root, '.production', folder)
    fs.mkdirpSync(target)
    fs.copySync(path.join(root, folder), target)
  })
}

const postbuild = (root, _duosite) => {
  // console.log('%%% site postbuild ', root, _duosite)
}

module.exports = {
  prebuild,
  postbuild,
  build,
}
