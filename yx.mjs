#!/usr/bin/env node

import commandLineUsage from 'command-line-usage'
import fetch from 'node-fetch'
import chalk from 'chalk'

import commandLineArgs from 'command-line-args'

import fs from 'fs-extra'
import path from 'path'
import Jimp from 'jimp'

import { Image, createCanvas } from 'canvas'

import { loadGlobalSettings, loadGlobalI18NMessages } from './src/utils.mjs'

import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const YX_ROOT = process.cwd()

const settings = await loadGlobalSettings(YX_ROOT)

const i18nm = await loadGlobalI18NMessages(__dirname, settings.lang)

const cmd = process.argv[2]

const sections = [
  {
    header: '上链易NFT作品集下载工具',
    content: '使用项目密钥和作品集ID下载整个作品集',
  },
  {
    header: '命令格式',
    content: 'npx nftstudio download <参数> ',
  },

  {
    header: '参数',
    optionList: [
      {
        name: 'token',
        typeLabel: '{underline string}',
        alias: 't',
        description: '项目密钥.从项目设置获得',
      },
      {
        name: 'collection',
        alias: 'c',
        description: '作品集ID.从作品集信息获得',
      },
      {
        name: 'out',
        alias: 'o',
        description: '作品集输出目录，必须为空目录。默认为当前目录',
      },

      {
        name: 'help',
        alias: 'h',
        description: '输出本指南',
      },
    ],
  },
  {
    header: '示例',
    content: [
      {
        name: '示例1',
        summary:
          'npx nftstudio download -t acbdef -c 1234-abcd -o "/abc/def"        #指定输出目录',
      },
      {
        name: '示例2',
        summary:
          'npx nftstudio download -t acbdef -c 1234-abcd        #使用当前目录作为输出目录',
      },
    ],
  },
]
const usage = commandLineUsage(sections)

/* first - parse the main command */
const mainDefinitions = [{ name: 'command', defaultOption: true }]
const mainOptions = commandLineArgs(mainDefinitions, {
  stopAtFirstUnknown: true,
})

const argv = mainOptions._unknown || []

let mergeOptions

if (mainOptions.command === 'download') {
  try {
    const mergeDefinitions = [
      { name: 'token', alias: 't' },
      { name: 'collection', alias: 'c' },
      { name: 'out', alias: 'o', defaultValue: '.' },
    ]
    mergeOptions = commandLineArgs(mergeDefinitions, {
      argv,
      stopAtFirstUnknown: false,
    })
  } catch (e) {
    console.warn(chalk.yellow('命令格式错误'))
    console.log(usage)
    process.exit(-1)
  }
} else {
  console.warn(chalk.yellow('命令格式错误'))
  console.log(usage)
  process.exit(-1)
}

if (!mergeOptions.token || !mergeOptions.collection) {
  console.warn(chalk.yellow('\n命令格式错误\n\n使用方法：'))
  console.log(usage)
  process.exit(-1)
}

const { token, collection, out } = mergeOptions

const children = fs.readdirSync(out)

if (children && children.length > 0) {
  console.log(chalk.yellow(`您的输出目录有内容，请选择空目录作为输出目录。`))
  process.exit(-1)
}
const apiRoot =
  process.env['SHANGLIANYI_API_ROOT'] || 'https://shanglianyi.cn/server/api/v1/'

console.log('获取作品集数据')

const headers = {
  ['x-shanglianyi-project-token']: `Bearer ${token}`,
}

const getCollectionResp = await fetch(
  `${apiRoot}/_sdk/collection?collection_id=${collection}`,
  {
    headers,
  }
)

const status = getCollectionResp.status

if (status === 400) {
  console.warn(chalk.yellow('作品集ID格式错误'))
  process.exit(-1)
}

if (status === 403) {
  console.warn(chalk.yellow('没有权限'))
  process.exit(-1)
}

if (status === 404) {
  console.warn(chalk.yellow('没有找到项目或作品集'))
  process.exit(-1)
}

if (status > 299) {
  console.warn(chalk.yellow('未知错误'))
  process.exit(-1)
}

const collectionJson = await getCollectionResp.json()

const { name, data } = collectionJson

const { snap_shot, generated_seqs } = data

// console.log(seqs)
// process.exit(1)
console.log('获取作品集素材')

const { components, classes } = snap_shot

const downloaded = []

let width, height
for (const component of components) {
  const newItems = []

  const { items, groupName } = component
  let i = 0
  for (const item of items) {
    const { key } = item
    const url = `${apiRoot}/_project_file/${key}`
    const resp = await fetch(url, { headers })
    const status = resp.status
    if (status === 200) {
      const imageBuffer = await resp.arrayBuffer()
      const image = new Image()
      image.src = Buffer.from(imageBuffer)
      newItems.push({ ...item, image })
      // console.log(image)
      width = image.width
      height = image.height
      i++
      console.log(chalk.green(`下载完成部件 ${groupName} 第 ${i} 个素材`))
      // }
    } else {
      console.log(chalk.red('下载素材出错。请检查网络后重试'))
      process.exit(-1)
    }
  }
  downloaded.push({ ...component, items: newItems })
}

const ranksRange = new Array(classes.length + 1).fill(1)

let generatedCount = 0

let total = 0

const values = Object.values(generated_seqs)

values.forEach(seqs => {
  total += seqs.length
})

ranksRange.forEach((_, rankIndex) => {
  const seqs = generated_seqs[rankIndex]

  const classSetting = classes[rankIndex]
  const { name = '未分级' } = classSetting || {}
  const rankPath = path.join(out, name)
  try {
    fs.mkdirSync(rankPath)
  } catch (e) {
    // ignore
  }

  // each rank
  seqs.forEach((seq, outputIndex) => {
    // each output

    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // combine images

    seq.forEach((imageIndex, componentIndex) => {
      const component = downloaded[componentIndex]
      const { items } = component
      if (imageIndex >= 0) {
        // console.log(items[imageIndex])
        const { image } = items[imageIndex]
        ctx.drawImage(image, 0, 0)
      }
    })
    const outBuf = canvas.toBuffer()
    fs.writeFileSync(path.join(rankPath, `${outputIndex}.png`), outBuf)
    generatedCount += 1
    console.log(chalk.green(`成功输出 (${generatedCount} / ${total})`))
  })
})
