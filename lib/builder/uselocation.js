'use strict'

var path = require('path')
var log = require('npmlog')
var fs = require('vigour-fs-promised')

module.exports = exports = function () {
  log.info('- creating redirect html for -')
  if (this.location) {
    var templatePath = path.join(__dirname, 'index.html.template')
    return fs.readFileAsync(templatePath, 'utf8')
      .then((template) => {
        var html = template.replace(/{{url}}/g, this.location)
        var htmlPath = path.join(this.wwwDst, 'index.html')
        return fs.writeFileAsync(htmlPath, html, { encoding: 'utf8', mkdirp: true })
      })
  }
}
