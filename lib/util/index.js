'use strict'

var fs = require('vigour-fs-promised')
var os = require('os')
var mustache = require('mustache')
var Promise = require('promise')

function nativeUtil () {

}

nativeUtil.transform_template = function (inputfile, outputfile, data) {
  return fs.readFileAsync(inputfile, 'utf8')
    .then((template) => {
      return fs.writeFileAsync(outputfile,
        mustache.render(template, data),
        {
          encoding: 'utf8',
          mkdirp: true
        })
    })
}

nativeUtil.zip = function (inputdir, zipfilename, callback) {
  return new Promise(function (resolve, reject) {
    var archiver = require('archiver')
    var output = fs.createWriteStream(zipfilename)
    var archive = archiver('zip')

    output.on('close', function () {
      console.log(zipfilename + ': ' + archive.pointer() + ' total bytes')
      if (typeof callback === 'function') {
        callback(archive.pointer())
      }
    })

    archive.on('error', function (err) {
      throw err
    })

    archive.pipe(output)
    archive.bulk([
      { expand: true, cwd: inputdir, src: ['**'], dest: '' }
    ])
    archive.finalize()
    resolve()
  })
}

nativeUtil.getIP = function (opts) {
  if (opts.ip && opts.ip !== '') {
    return opts.ip
  }
  var ifaces = os.networkInterfaces()
  for (var dev in ifaces) {
    for (var i = 0; i < ifaces[dev].length; i++) {
      var details = ifaces[dev][i]
      if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
        return details.address
      }
    }
  }
  return '127.0.0.1'
}

module.exports = nativeUtil
