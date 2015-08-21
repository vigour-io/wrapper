var fs = require('vigour-fs')
  , ncp = require('ncp')
  , rimraf = require('rimraf')
  , path = require('path')
  , Promise = require('promise')
  , proc = require('child_process')
  , spawn = proc.spawn
  , nativeUtil = require("../../util")
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
		.then(createStructure)
		.then(buildConfigXml)
		.then(teste)
		.catch(function () {
			console.log(arguments,"error")
		})
}

function configure (opts) {
	var options = opts.native.platforms.samsung
	options.root = opts.native.root
	options.templateSrc = path.join(__dirname, '..', '..', '..', 'templates', 'samsung')
	options.buildDir = path.join(options.root, 'build', 'samsung')
	return(options)

}

function clean (opts) {
	console.log('- clean samsung build dir -')
	
	return _rimraf(opts.buildDir)
		.then(function () {
			return opts
		})
}

function createStructure (opts) {
	console.log("- creating folder structure for samsung -")

	return _mkdir(opts.buildDir)
		.then(function () {
			return opts
		})
}

function buildConfigXml (opts) {
	console.log("- creating config.xml for samsung -")

	nativeUtil.transform_template(opts.templateSrc + "/config.xml", path.join(opts.root, 'build', 'samsung/config.xml'), opts.xmlConfig)

}


