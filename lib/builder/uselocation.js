'use strict'

var path = require('path')
var log = require('npmlog')
var fs = require('vigour-fs-promised')

module.exports = exports = function () {
  log.info('- creating redirect html -')
  var self = this
  if (self.location) {
    var templatePath = path.join(__dirname, 'index.html.template')
    return fs.readFileAsync(templatePath, 'utf8')
      .then(function (template) {
        var html = template.replace(/{{url}}/g, self.location)
        var htmlPath = path.join(self.wwwDst, 'index.html')
        return fs.writeFileAsync(htmlPath, html, 'utf8')
      })
  }
}
