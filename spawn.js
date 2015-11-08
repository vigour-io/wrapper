'use strict'

var proc = require('child_process')

module.exports = exports = function (command, args, opts) {
  return new Promise(function (resolve, reject) {
    opts.stdio = 'inherit'
    var running = proc.spawn(command, args, opts)
    running.on('error', function (err) {
      reject(err)
    })
    running.on('exit', function () {
      resolve()
    })
  })
}
