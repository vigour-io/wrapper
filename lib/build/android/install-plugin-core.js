#!/usr/bin/env node
var path = require('path')
var log = require('npmlog')
var tasks = require('./tasks.js')

module.exports = exports = function () {
  log.info(' --- installing plugin.core --- ')
  return tasks.buildCore(path.join(__dirname, '..', '..', '..', 'templates', 'android', 'plugincore'))
}
