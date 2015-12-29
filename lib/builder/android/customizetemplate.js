'use strict'

var log = require('npmlog')
var path = require('path')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')
var editXML = Promise.denodeify(fs.editXML)

/**
 * Customizes the Android project to use the correct application ID, product
 * name and splash screen duration as configured in the project's package.json
 * file.
 *
 * @memberof AndroidBuilder
 * @instance
 * @function customizeTemplate
 */
module.exports = exports = function () {
  if (this.builds) {
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
  } else {
    log.info('- skipping customize template -')
  }
}
