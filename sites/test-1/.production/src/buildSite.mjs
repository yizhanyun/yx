import rimraf from 'rimraf'
import path from 'path'
import fs from 'fs-extra'

const prebuild = async (root, _duosite) => {
  // console.log('%%% site prebuild ', root, _duosite)
}

const build = async (root, _duosite) => {
  console.log('Clearing .produciton folder')
  rimraf.sync(path.join(root, '.production'))
  fs.mkdirpSync(path.join(root, '.production'))

  const filesForCopy = ['settings.mjs', 'settings.production.mjs']

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

const postbuild = async (root, _duosite) => {
  // console.log('%%% site postbuild ', root, _duosite)
}

export { prebuild, postbuild, build }
