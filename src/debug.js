const createDebug = require('debug')
const package = require('../package.json')

module.exports = createDebug(package.name)
