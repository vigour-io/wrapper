'use strict'

var platform = module.exports = exports = {}

platform.send = function (pluginId, fnName, opts, cbId, cb) {
    console.log('bridge.send ing to fake nothing!')
  setTimeout(function () {
    window.vigour.native.bridge.result(cbId, null, opts)
  }, 200)
}

platform.write = function write (message, cb) {
	console.log('writing', message, 'to stub')
	if(cb) {
		cb(null, 'great success!')
	}
}