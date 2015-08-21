var fs = require('vigour-fs')
  , ncp = require('ncp')
  , rimraf = require('rimraf')
  , path = require('path')
  , Promise = require('promise')
  , proc = require('child_process')
  , spawn = proc.spawn
  , log = require('npmlog')
  , readFile = fs.readFileSync
  , _mkdir = Promise.denodeify(fs.mkdirp)
  , _ncp = Promise.denodeify(ncp)
  , _rimraf = Promise.denodeify(rimraf)


module.exports = exports = function (opts, shared) {
	console.log("------Building Samsung------")
	return Promise.resolve(opts)
		.then(configure)
		.then(clean)
		.then(buildXmlFiles)
		.catch(shared.handleErrors('samsung'))
}

function configure (opts) {
	var options = opts.native.platforms.ios
	options.root = opts.native.root
	options.buildDir = path.join(options.root, 'build', 'samsung')
	return(options)

}

function buildXmlFiles (opts) {
	return _mkdir(opts.buildDir)
		.then(function () {
			return opts
		})
}

function clean (opts) {
	console.log('- clean samsung build dir -')
	return _rimraf(opts.buildDir)
		.then(function () {
			return opts
		})
}
