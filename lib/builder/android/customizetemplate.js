'use strict'

var log = require('npmlog')
var path = require('path')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')
var editXML = Promise.denodeify(fs.editXML)

module.exports = exports = function () {
  var self = this
  log.info('- customize template -')
  return editXML(path.join(this.srcDir, 'res', 'values', 'template.xml'),
    function (xml) {
      if (self.appIndexPath) {
        xml.resources.string[1]._ = self.appIndexPath
      }
      if (self.productName) {
        xml.resources.string[0]._ = self.productName
      }
      if (self.splashDuration) {
        xml.resources.integer[0]._ = self.splashDuration
      }
      return xml
    })
}
