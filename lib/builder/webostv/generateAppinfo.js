'use strict'

var log = require('npmlog')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')
var remove = Promise.denodeify(fs.remove)

module.exports = exports = function () {
  log.info('- creating the appinfo.json for webostv-')
  return new Promise(function (resolve, reject) {
    fs.writeFile(opts.buildDir + "/appinfo.json", JSON.stringify(opts.appinfo, null, 4), function(err) {
      if(err) {
        console.log(err)
      } else {
        resolve(opts)
      }
    })
  })
}
