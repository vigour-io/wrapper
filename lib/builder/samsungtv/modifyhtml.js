'use strict'

var log = require('npmlog')
var path = require('path')
var fs = require('vigour-fs-promised')

module.exports = exports = function () {
  var self = this
  log.info('- creating the html for samsung TV-')
  var srcPath = path.join(self.buildDir, 'build.html')
  var dstPath = path.join(self.buildDir, 'index.html')
  return fs.readFileAsync(srcPath, 'utf8')
    .then(function (html) {
      html = html.replace('</head>',
        "<script type='text/javascript' language='javascript' src='$MANAGER_WIDGET/Common/API/Widget.js'></script>\n" +
        "<script type='text/javascript' language='javascript' src='$MANAGER_WIDGET/Common/API/TVKeyValue.js'></script>\n" +
        "<script type='text/javascript' language='javascript' src='$MANAGER_WIDGET/Common/API/Plugin.js'></script>\n" +
        "<script type='text/javascript' language='javascript' src='$MANAGER_WIDGET/Common/af/2.0.0/loader.js'></script>\n" +
        "<object id='pluginAudio' border=0 classid='clsid:SAMSUNG-INFOLINK-AUDIO'></object>\n" +
        "<object id='pluginObjectTVMW' border=0 classid='clsid:SAMSUNG-INFOLINK-TVMW'></object>\n" +
        "<object id='pluginObjectNNavi' border=0 classid='clsid:SAMSUNG-INFOLINK-NNAVI' style='opacity:0.0;background-color:#000000;width:0px;height:0px;'></object>\n" +
        "<object id='pluginWindow' classid='clsid:SAMSUNG-INFOLINK-WINDOW' style='visibility:hidden; position:absolute; width: 0; height: 0; opacity: 0;'></object>\n" +
        "<object id='pluginObjectNetwork' border='0' classid='clsid:SAMSUNG-INFOLINK-NETWORK'></object>\n" +
        "<object id='pluginObjectTV' border=0 classid='clsid:SAMSUNG-INFOLINK-TV' style='opacity:0.0;background-color:#000000;width:0px;height:0px;'></object>\n" +
        "<object id='pluginPlayer' border=0 classid='clsid:SAMSUNG-INFOLINK-PLAYER' style='visibility:hidden; position:absolute; width: 0; height: 0; opacity: 0;'></object>\n" +
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
