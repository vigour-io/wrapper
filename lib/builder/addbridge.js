'use strict'

var log = require('npmlog')
var path = require('path')
var browserify = require('browserify')
var concat = require('concat-stream')
var Promise = require('promise')
var fs = require('vigour-fs-promised')

module.exports = exports = function () {
  if (this.opts.doExternalAssets) {
    log.info('- adding bridge -')
    var bridgePath = 'vigour-wrapper-bridge/lib/platform/' + this.platform
    var tasks = []
    var found = this.locateAsset(this.html)
    if (found.assets) {
      tasks.push(path.join(this.wwwDst, this.html))
    }
    if (found.externalAssets) {
      tasks.push(path.join(this.externalAssetsDir, this.html))
    }
    if (tasks.length === 0) {
      var error = new Error('Invalid configuration')
      error.info = "Can't find app index (" + this.html + ') to add bridge'
      error.todo = 'Make sure `appIndexPath` is set to a file that appears in either `assets` or `externalAssets`'
      throw error
    }
    return tasks.reduce((prev, curr, index, arr) => {
      prev.then(() => {
        return addBridge(curr, bridgePath)
      })
    }, Promise.resolve())
  } else {
    log.info('- skipping adding bridge -')
    return Promise.resolve()
  }
}

function addBridge (htmlPath, bridgePath) {
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
