var fs = require('vigour-fs')
	, rimraf = require('rimraf')
  , path = require('path')
	, ncp = require('ncp')
	, Promise = require('promise')
	, xcode = require('xcode')
	, plist = require('plist')
	, browserify = require('browserify')
	, concat = require('concat-stream')
	, flatten = require('vigour-js/util/flatten.js')
	, _mkdir = Promise.denodeify(fs.mkdirp)
	, _ncp = Promise.denodeify(ncp)
	, _rimraf = Promise.denodeify(rimraf)
	, _cp = Promise.denodeify(fs.cp)
	, _readFile = Promise.denodeify(fs.readFile)
	, _writeFile = Promise.denodeify(fs.writeFile)

	// vars
	, localBuildDir = path.join(process.cwd(), 'build/ios')

function configure (opts) {
	console.log("- configure ios build paths -")
	opts.templateSrc = path.join(__dirname, '..', '..', '..', 'templates', 'ios')
	opts.buildDir = path.join(opts.root, 'build', 'ios')
	return opts
}

function clean (opts) {
	console.log('- clean ios build dir -')
	return _rimraf(opts.buildDir)
		.then(function () {
			return opts
		})
}

function prepare (opts) {
	console.log('- prepare ios template -')
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

/**
		configure the template xcode project
	*/
function configureTemplate (opts) {
	console.log('- configure template -')
	opts.projectPath = path.join(opts.buildDir, 'vigour-native/vigour-native.xcodeproj/project.pbxproj')
	var templateProj = xcode.project(opts.projectPath)
	
	return new Promise(function (resolve, reject) {
		templateProj.parse(function (err) {
			if (err) {
				reject(err)
			} else {
				// templateProj.addHeaderFile('foo.h');
				// templateProj.addSourceFile('foo.m');
				// templateProj.addFramework('FooKit.framework');
				
				// templateProj.addResourceFile()

				// if(opts.platforms.ios.productName) {
				// 	templateProj.updateProductName(replaceSpacesWithDashes(opts.platforms.ios.productName))
				// }

				//add framework stuff.. plugins etc.	
					
				fs.writeFileSync(opts.projectPath, templateProj.writeSync())
				resolve(opts)
			}
		})
	})
}

/**
			Helpers
 **/

function replaceSpacesWithDashes(/*String*/ str) {
	return str.replace(/\s+/g, '-').toLowerCase()
}


/**
		override default plist settings
 **/
function modifyPlist(opts) {
	console.log('configure project')
	opts.plistPath = path.join(opts.buildDir, 'vigour-native/vigour-native/Info.plist')
	opts.plistObject = plist.parse(fs.readFileSync(opts.plistPath, 'utf8'))
	
	// var versionNumber = parseInt(plistObject["CFBundleVersion"])
	// plistObject["CFBundleVersion"] = '' + ++versionNumber

	if(opts.platforms.ios.organizationIdentifier) {
		opts.plistObject.CFBundleIdentifier = opts.platforms.ios.organizationIdentifier
	}
	
	if(opts.platforms.ios.buildNumber) {
		opts.plistObject.CFBundleVersion = opts.platforms.ios.buildNumber
	}
	
	if(opts.platforms.ios.productName) {
		opts.plistObject.CFBundleName = opts.platforms.ios.productName
	}
	
	if(opts.platforms.ios.appUrlIdentifier && opts.platforms.ios.appUrlScheme) {
		opts.plistObject.CFBundleURLTypes = []
		var urlScheme = {
			CFBundleTypeRole:"Editor",
			CFBundleURLName:opts.platforms.ios.appUrlIdentifier,
			CFBundleURLSchemes: [opts.platforms.ios.appUrlScheme]
		}
		opts.plistObject.CFBundleURLTypes.push(urlScheme)
	}
	
	if(opts.platforms.ios.appIndexPath) {
		opts.plistObject.appIndexPath = opts.platforms.ios.appIndexPath
	}
	else {
		 throw new Error("platforms.ios.appIndexPath should be provided!")
	}
	
	fs.writeFileSync(opts.plistPath, plist.build(opts.plistObject))
	return opts
}

/**
		copy web app stuff
 **/
function copyWebAppResources (opts) {
	console.log('- copy resources -')

	opts.wwwDst = path.join(opts.buildDir, 'vigour-native', 'www')
	console.log('assets', opts.packer.assets)
	// console.log('www dst', opts.wwwDst)
	// console.log('working directory', opts.cwd)
	return fs.expandStars(opts.packer.assets, opts.cwd)
		.then(flatten)
		.then(function (resources) {
			var res
				, arr = []
				, dst
				, prefix
				, p
			for (res in resources) {

				src = path.join(process.cwd(), res)
				dst = path.join(opts.wwwDst, res)
				// console.log("Copying", src, "\nTO", dst)
				arr.push(_cp(src
					, dst))
			}

			return Promise.all(arr)
		})
		.then(function (res) {
			return opts
		}, function (err) {
			console.error("Oops", err)
		})
}

function addBridge (opts) {
	console.log('- adding bridge -')
	var bridgePath = path.join(__dirname, '..', '..', 'bridge', 'ios', 'index.js')
		, htmlPath = path.join(opts.wwwDst, opts.platforms.ios.appIndexPath)
		, bro = browserify()
		, _html
	return readHtml()
		.then(buildBridge)
		.then(writeHtml)

	function readHtml () {
		return _readFile(htmlPath, 'utf8')
			.then(function (html) {
				_html = html
			})
	}
	function buildBridge () {
		return new Promise(function (resolve, reject) {
			var out = concat('string', function (data) {
				resolve(data)
			})
			bro.add(bridgePath)
			bro.bundle().pipe(out)
			bro.on('error', reject)
		})
	}
	function writeHtml (bridgeCode) {
		var newHtml = _html.replace("<head>", "<head><script type='text/javascript'>" + bridgeCode + "</script>", "i")
		return _writeFile(htmlPath, newHtml, 'utf8')
	}
}

module.exports = exports = function (opts, packerOpts) {
  console.log('- start ios build -')
	return Promise.resolve(configure(opts))
		.then(clean)
		.then(prepare)
		.then(configureTemplate)
		.then(modifyPlist)
		.then(copyWebAppResources)
		.then(addBridge)
		.then(function() {
			console.log("__FINISHED__")
		})
}