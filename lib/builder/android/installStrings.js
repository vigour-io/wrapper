'use strict'

var log = require('npmlog')
var path = require('path')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')
var editXML = Promise.denodeify(fs.editXML)

module.exports = exports = function () {
  log.info('- install strings -')
  var strings = this.strings
  return editXML(path.join(this.srcDir, 'res', 'values', 'strings.xml'),
    function (xml) {
      // log.info('strings before', JSON.stringify(xml, null, ' '))
      var allStrings = {}
      xml.resources.string.forEach(function (s) {
        // log.info('existing: ', s)
        allStrings[s.$.name] = s
      })
      log.info('s', strings)
      // todo prevent doubles!!
      for (var key in strings) {
        allStrings[key] = {'_': strings[key], '$': {'name': key}}
      }
      xml.resources.string = Object.keys(allStrings).map(function (key) {
        return allStrings[key]
      })
      // log.info('strings after', JSON.stringify(xml, null, ' '))
      return xml
    })
}
