const OSS = require('ali-oss')
const path = require('path')
const fs = require('fs')

const map = process.argv.slice(2).reduce((map, arg) => {
  const [key, value] = arg.split('=')
  map[key] = value
  return map
}, {})

console.log('map: ', map)

const client = new OSS({
  region: 'oss-cn-beijing',
  accessKeyId: map.accessKeyId,
  accessKeySecret: map.accessKeySecret,
  bucket: 'authing-cdn-cn-prod'
})

async function put (ossPath) {
  try {
    const { version } = require(`${process.cwd()}/package.json`)
    await client.put(
      `packages/authing-sso/${version}/${ossPath}`, 
      path.normalize(`${process.cwd()}/build/${ossPath}`)
    )
  } catch (e) {
    console.error('put oss error: ', e)
  }
}

function getAndPutFile (dir = `${process.cwd()}/build`) {
  fs.readdirSync(dir).forEach(async (item) => {
    const fullPath = path.join(dir, item)
    
    if (fs.statSync(fullPath).isDirectory()) {
      return getAndPutFile(fullPath)
    }

    const separator = '/build/'
    const index = fullPath.indexOf(separator)
    const ossPath = fullPath.slice(index + separator.length)
    put(ossPath)
  })
}

getAndPutFile()
