const fs = require('fs')
const path = require('path')

const files = fs.readdirSync(__dirname).filter(fileName => fileName.indexOf('index.ts') === -1)
const apiMap = {}

files.forEach(file => {
  const _file = '/' + file.substring(0, file.length - path.extname(file).length).replace(/_/g, '/')

  Object.defineProperty(apiMap, _file, {
    get () {
      try {
        return require(path.join(__dirname, file))
      } catch (e) {
        return {}
      }
    },
    configurable: false,
    enumerable: true
  })
})

module.exports = apiMap
