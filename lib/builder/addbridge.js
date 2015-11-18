'use strict'

var log = require('npmlog')
var path = require('path')
var browserify = require('browserify')
var concat = require('concat-stream')
var Promise = require('promise')
var fs = require('vigour-fs-promised')

module.exports = exports = function () {
  log.info('- adding bridge -')
  var bridgePath = path.join(__dirname, '..', 'bridge', this.platform, 'index.js')
  var htmlPath = path.join(this.wwwDst, this.appIndexPath)
  var bro = browserify()
  var _html
  return readHtml()
    .then(buildBridge)
    .then(writeHtml)

  function readHtml () {
    return fs.readFileAsync(htmlPath, 'utf8')
      .then(function (html) {
        _html = html
      })
  }
  function buildBridge () {
    return new Promise(function (resolve, reject) {
      var out = concat('string', function (data) {
        resolve(data)
      })
      bro.add(bridgePath)
      bro.bundle().pipe(out)
      bro.on('error', reject)
    })
  }
  function writeHtml (bridgeCode) {
    var newHtml = _html.replace('<head>', "<head><script type='text/javascript'>" + bridgeCode + '</script>', 'i')
    return fs.writeFileAsync(htmlPath, newHtml, 'utf8')
  }
}
