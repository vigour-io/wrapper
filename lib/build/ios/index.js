var fs = require('vigour-fs')
	, rimraf = require('rimraf')
  , path = require('path')
	, ncp = require('ncp')
	, Promise = require('promise')
	, xcode = require('xcode')
	, plist = require('plist')
	, flatten = require('vigour-js/util/flatten.js')
	, _mkdir = Promise.denodeify(fs.mkdirp)
	, _ncp = Promise.denodeify(ncp)
	, _rimraf = Promise.denodeify(rimraf)

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
	console.log('configure template')
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
	
	fs.writeFileSync(opts.plistPath, plist.build(opts.plistObject))
	return opts
}

/**
		copy web app stuff
 **/
function copyWebAppResources (opts) {
	console.log('copy resources')

	opts.wwwDst = path.join(opts.buildDir, 'vigour-native', 'www')
	console.log('assets', opts.packer.assets)
	console.log('www dst', opts.wwwDst)
	console.log('working directory', opts.cwd)
	return fs.expandStars(opts.packer.assets, opts.cwd)
		.then(flatten)
		.then(function (resources) {
			var res
				, arr = []
			for (res in resources) {

				arr.push(_ncp(res
					, opts.wwwDst
					, { clobber: true }))
			}

			return Promise.all(arr)
		})
		.then(function (res) {

			return opts
		}, function (err) {

		})
}



module.exports = exports = function (opts, packerOpts) {
  console.log('- start ios build -')
	return Promise.resolve(configure(opts))
		.then(clean)
		.then(prepare)
		.then(configureTemplate)
		.then(modifyPlist)
		.then(copyWebAppResources)
		.then(function() {
			console.log("__FINISHED__")
		})
}