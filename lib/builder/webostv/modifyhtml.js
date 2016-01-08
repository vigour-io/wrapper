'use strict'

var log = require('npmlog')
var path = require('path')
var fs = require('vigour-fs-promised')

module.exports = exports = function () {
  var self = this
  log.info('- creating the html for webos TV-')
  var srcPath = path.join(self.buildDir, 'build.html')
  var dstPath = path.join(self.buildDir, 'build.html')
  return fs.readFileAsync(srcPath, 'utf8')
    .then(function (html) {
      html = html.replace('</head>',
        "<script type='text/javascript' language='javascript' src='webos.js'></script>\n" +
        '</head>')
      if (self.url) {
        html = html.replace('</head>',
          '<script type="text/javascript" language="javascript">window.urlToLoad = "' + self.url + '"</script>\n' +
          '</head>')
      }
      return fs.writeFileAsync(srcPath, html, 'utf8')
    })
    .then(function () {
      return fs.renameAsync(srcPath, dstPath)
    })
}
