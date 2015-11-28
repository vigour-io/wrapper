'use strict'

var platform = module.exports = exports = {}

platform.send = function stubSend(pluginId, fnName, opts, cbId, cb) {
	console.log('stub sending', arguments)
  setTimeout(function () {
    window.vigour.native.bridge.result(cbId, null, opts)
  }, 200)
}

platform.write = function stubWrite (message, cb) {
	console.log('stub writing', arguments)
	if(cb) {
		cb(null, 'great success!')
	}
}

platform.emit = function stubEmit (event, data) {
	console.log('stub emitting', arguments)
}