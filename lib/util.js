var fs = require('fs')
var path = require('path')
var mustache = require('mustache')


function nativeUtil() {
}



nativeUtil.transform_template = function(inputfile, outputfile, data) {
  var template = fs.readFileSync(inputfile, "utf8")
  var s = mustache.render(template, data)
  fs.writeFileSync(outputfile, s)
}


module.exports = nativeUtil