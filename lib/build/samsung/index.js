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
		.then(buildEclipseProject)
		.then(buildHtml)
		.then(copyJsBuild)
		.then(copyCssBuild)
		.then(test1)
		.then(test2)
		.then(zipAll)
		.then(function() {
			console.log("__FINISHED__")
			return true
		})
		.catch(function () {
			console.log(arguments,"error")
		})
}

function test1(opts) {
	console.log("11111")
	return new Promise(function (resolve, reject) {
		var file = fs.createReadStream(opts.templateSrc + "/uninstall.js").pipe(fs.createWriteStream(opts.buildDir + "/Uninstall.js"))	
		file.on("close",function() {
			resolve(opts)
		})	
	})
}
function test2(opts) {
	console.log("2222")
	return new Promise(function (resolve, reject) {
		var file = fs.createReadStream(opts.templateSrc + "/version.js").pipe(fs.createWriteStream(opts.buildDir + "/version.js"))	
		file.on("close",function() {
			resolve(opts)
		})	
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
	return new Promise(function (resolve, reject) {
		var file = fs.createReadStream(opts.templateSrc + "/widget.info").pipe(fs.createWriteStream(opts.buildDir + "/widget.info"))	
		file.on("close",function() {
			resolve(opts)
		})	
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
		nativeUtil.transform_template(opts.templateSrc + "/widgetlist.xml",  opts.root + '/build/widgetlist.xml', opts.xmlConfig)
		resolve(opts)
	})
}

function buildEclipseProject(opts) {
	console.log("eclipsee")
	return new Promise(function (resolve, reject) {
		nativeUtil.transform_template(opts.templateSrc + "/eclipse.project", opts.buildDir + '/.project', opts.xmlConfig)
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

function copyJsBuild (opts) {
	console.log("- creating the js for samsung -")
	return new Promise(function (resolve, reject) {
		var file = fs.createReadStream(opts.root + "/build.js").pipe(fs.createWriteStream(opts.buildDir + "/build.js"))	
		file.on("close",function() {
			resolve(opts)
		})	
	})
}

function copyCssBuild (opts) {
	console.log("- creating the css for samsung -")
	return new Promise(function (resolve, reject) {
		var file = fs.createReadStream(opts.root + "/build.css").pipe(fs.createWriteStream(opts.buildDir + "/build.css"))	
		file.on("close",function() {
			resolve(opts)
		})	
	})
}

function zipAll(opts) {
	console.log("-Creating the Zip file for samsung -")
	return new Promise(function (resolve, reject) {
		nativeUtil.zip(opts.buildDir, opts.buildDir + ".zip")	
		resolve(opts)
	})
	
}



