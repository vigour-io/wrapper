var fs = require('vigour-fs')
  , ncp = require('ncp')
  , path = require('path')
  , Promise = require('promise')
  , proc = require('child_process')
  , spawn = proc.spawn
  , log = require('npmlog')
  , _mkdir = Promise.denodeify(fs.mkdirp)
  , readFile = fs.readFileSync
  , _ncp = Promise.denodeify(ncp)


module.exports = exports = function (opts, shared) {
	console.log("------Building Samsung------")
	return Promise.resolve(opts)
		.then(configure)
		.then(build)
		.catch(shared.handleErrors('samsung'))
}

function build (opts) {
	return _mkdir(opts.buildDir)
		.then(function () {
			return _ncp(opts.templateSrc
					, opts.buildDir
					, { clobber: true })
		})
		.then(function () {
			return opts
		})
}

function configure (opts) {
	var options = opts.native.platforms.ios
	options.root = opts.native.root
	options.buildDir = path.join(options.root, 'build', 'samsung')

	return(options)

}