var fs = require('fs')
, path = require('path')
, mustache = require('mustache')
, globby = require('globby')


function nativeUtil() {
}

nativeUtil.transform_template = function(inputfile, outputfile, data) {
  var template = fs.readFileSync(inputfile, "utf8")
  var s = mustache.render(template, data)
  fs.writeFileSync(outputfile, s)
}


nativeUtil.buildIndexHtml = function(htmlPath) {
  globby(htmlPath, function (err, paths) {
    paths.map(function(path) {
      var html = fs.readFileSync(path, "utf8");
      html = html.replace("</head>",
				"<script type='text/javascript' language='javascript' src='$MANAGER_WIDGET/Common/API/Widget.js'></script>\n"+
				"<script type='text/javascript' language='javascript' src='$MANAGER_WIDGET/Common/API/TVKeyValue.js'></script>\n"+
				"<script type='text/javascript' language='javascript' src='$MANAGER_WIDGET/Common/API/Plugin.js'></script>\n"+
				"<object id='pluginAudio' border=0 classid='clsid:SAMSUNG-INFOLINK-AUDIO'></object>\n" +
				"<object id='pluginObjectTVMW' border=0 classid='clsid:SAMSUNG-INFOLINK-TVMW'></object>\n" +
				"<object id='pluginObjectNNavi' border=0 classid='clsid:SAMSUNG-INFOLINK-NNAVI' style='opacity:0.0;background-color:#000000;width:0px;height:0px;'></object>\n" +
				"<object id='pluginWindow' classid='clsid:SAMSUNG-INFOLINK-WINDOW' style='visibility:hidden; position:absolute; width: 0; height: 0; opacity: 0;'></object>\n" +
				"<object id='pluginObjectNetwork' border='0' classid='clsid:SAMSUNG-INFOLINK-NETWORK'></object>\n" +
				"<object id='pluginObjectTV' border=0 classid='clsid:SAMSUNG-INFOLINK-TV' style='opacity:0.0;background-color:#000000;width:0px;height:0px;'></object>\n" +
				"<object id='pluginPlayer' border=0 classid='clsid:SAMSUNG-INFOLINK-PLAYER' style='visibility:hidden; position:absolute; width: 0; height: 0; opacity: 0;'></object>\n" +
				"</head>");
      fs.writeFileSync(path, html);
    });
  });
}

module.exports = nativeUtil