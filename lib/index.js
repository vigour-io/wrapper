//here we need some lazy mechanism 
exports.util = require('./util')
exports.test = exports.util.isNode && require('./test')

Object.defineProperty(exports, 'mocha', {
	get:function() {
		return require('./test/mocha')
	}
})

if( !exports.util.isNode ) {
	//make the interfaces to a server
	var server = require('./server/client')
	//dit is de client side interface!
	exports.api = server.request

} 

exports.hub = require('./hub')

