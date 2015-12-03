'use strict'

var path = require('path')
var log = require('npmlog')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')
var cp = Promise.denodeify(fs.cp)
var readFile = Promise.denodeify(fs.readFile)
var writeFile = Promise.denodeify(fs.writeFile)
var flatten = require('vigour-js/lib/util/flatten.js')

module.exports = exports = function () {
  log.info('- copying assets -')
  var self = this
  return new Promise(function (resolve, reject) {
    if (!self.assets) {
      var error = new Error('Invalid configuration')
      error.info = 'Missing `vigour.native.platforms.<platform>.assets`'
      return reject(error)
    }
    // log.info('assets', self.assets)
    if (typeof self.assets === 'string') {
      return resolve(boom.call(self, self.assets))
    }
    // log.info('root', self.root)
    resolve(fs.expandStars(self.assets, self.root)
      .then(function (val) {
        // log.info('val', val)
        return flatten(val, '/')
      })
      .then(function (resources) {
        // log.info('resources', resources)
        var res
        var arr = []
        var dst
        var src
        // var p
        for (res in resources) {
          src = path.join(self.root, res)
          dst = path.join(self.wwwDst, res)
          // if (self.debug && res === 'build.js') {
          // src = path.join(self.root, 'bundle.js')
          // }
          log.info('copying', src, 'to', dst)
          arr.push(cp(src, dst, { mkdirp: true }))
        }
        return Promise.all(arr)
      }))
  })
}

function boom (str) {
  var self = this
  var templatePath = path.join(__dirname, 'index.html.template')
  console.log('template', templatePath)
  return readFile(templatePath, 'utf8')
    .then(function (template) {
      console.log('templateContents', template)
      var html = template.replace(/{{url}}/g, str)
      console.log('html', html)
      var htmlPath = path.join(self.wwwDst, 'index.html')
      console.log('htmlpath', htmlPath)
      return writeFile(htmlPath, html, 'utf8')
    })
}
