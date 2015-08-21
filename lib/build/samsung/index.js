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
	console.log("------ Building Samsung ------")
	return Promise.resolve(opts)
		.then(configure)
		.then(clean)
		.then(createStructure)
		.then(buildWidgetInfo)
		.then(buildConfigXml)
		.then(buildWidgetList)
		.then(buildHtml)
		.then(next)
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

function buildWidgetInfo (opts) {
	console.log("- creating widget info for samsung -")
	return _ncp(opts.templateSrc
	, opts.buildDir
	, { clobber: true }).then(function() {
		return opts
	})
}

function buildConfigXml (opts) {
	console.log("- creating config.xml for samsung - ")
	return new Promise(function (resolve, reject) {
		nativeUtil.transform_template(opts.templateSrc + "/config.xml", opts.buildDir + '/config.xml', opts.xmlConfig)
		resolve(opts)
	})
}

function buildWidgetList (opts) {
	console.log("- creating the widget list for samsung -")
	return new Promise(function (resolve, reject) {
		nativeUtil.transform_template(opts.templateSrc + "/widgetlist.xml", opts.buildDir + '/widgetlist.xml', opts.xmlConfig)
		resolve(opts)
	})
}

function buildHtml (opts) {
	console.log("- creating the html for samsung -")
	return new Promise(function (resolve, reject) {
		var file = fs.createReadStream(opts.root + "/index.html").pipe(fs.createWriteStream(opts.buildDir + "/index.html"))	
		file.on("close",function() {
			nativeUtil.buildIndexHtml(opts.buildDir + "/index.html")
			resolve(opts)
		})	
	})
}







