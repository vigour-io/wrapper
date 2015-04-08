var fs = require('vigour-fs')
	, rimraf = require('rimraf')
  , path = require('path')
	, ncp = require('ncp')
	, Promise = require('promise')
	, _mkdir = Promise.denodeify(fs.mkdirp)
	, xcode = require('xcode')
	, plist = require('plist')
	, _ncp = Promise.denodeify(ncp)

	// vars
	, localBuildDir = path.join(process.cwd(), 'build/ios')


function clean() {
	console.log('- clean ios build dir -')
	return new Promise(
		function(resolve, reject) { 
			rimraf(localBuildDir, function(err) {
				if (err) {
					console.log(err)
					reject(err)
				}
				else {
					resolve()
				}
			}
		)}
	)	
}

function prepare() {
	console.log('- prepare ios template -')
	var src = path.join(__dirname, '..', '..', 'templates', 'ios')

	return _mkdir(localBuildDir)
	       .then(function(){ return _ncp( src
	                 , localBuildDir
	                 , {clobber: true})})
}


/**
			Helpers
 **/

function replaceSpacesWithDashes(/*String*/ str) {
	return str.replace(/\s+/g, '-').toLowerCase()
}


/**
		configure the template xcode project
	*/
function configureTemplate(options) {
	
	console.log('configure template')
	var projectPath = path.join(localBuildDir, 'vigour-native/vigour-native.xcodeproj/project.pbxproj')
	var templateProj = xcode.project(projectPath)
	
	templateProj.parse(function (err) {
	    // templateProj.addHeaderFile('foo.h');
	    // templateProj.addSourceFile('foo.m');
	    // templateProj.addFramework('FooKit.framework');
		
			if(err) {
				console.log(err)
				return
			}
			
			// templateProj.addResourceFile()
			
			// if(options.platforms.ios.productName) {
			// 	templateProj.updateProductName(replaceSpacesWithDashes(options.platforms.ios.productName))
			// }
  
			//add framework stuff.. plugins etc.	
				
	    fs.writeFileSync(projectPath, templateProj.writeSync());

	});	
}

/**
		override default plist settings
 **/
function modifyPlist(options) {
	var plistPath = path.join(localBuildDir, 'vigour-native/vigour-native/Info.plist')
	var plistObject = plist.parse(fs.readFileSync(plistPath, 'utf8'));
	
	// var versionNumber = parseInt(plistObject["CFBundleVersion"])
	// plistObject["CFBundleVersion"] = '' + ++versionNumber

	if(options.platforms.ios.organizationIdentifier) {
		plistObject["CFBundleIdentifier"] = options.platforms.ios.organizationIdentifier
	}
	
	if(options.platforms.ios.buildNumber) {
		plistObject["CFBundleVersion"] = options.platforms.ios.buildNumber
	}
	
	if(options.platforms.ios.productName) {
		plistObject["CFBundleName"] = options.platforms.ios.productName
	}
	
	fs.writeFileSync(plistPath, plist.build(plistObject))
	
}

/**
		copy web app stuff
 **/
function copyWebAppResources(options) {
	
	var src = path.join(localBuildDir, '..', '..', 'www')
	var dst = path.join(localBuildDir, 'vigour-native', 'www')
	console.log(src, dst)
  return _ncp(
			src
    , dst
    , { 
				clobber: true
      }
   ).catch(
		function(reason) {
				console.log(reason)
		}
   )
}

module.exports = exports = {}
exports.build = function(opts) {
  console.log('start ios build')
	return clean()
		.then( 
			function() {
			return prepare()
		})
		.then(
			function() {
				console.log('configure template')
				return configureTemplate(opts)
			})
		.then(
			function() {
				console.log('configure project')
				return modifyPlist(opts)
		})
		.then(
			function() {
				console.log('copy resources')
				return copyWebAppResources(opts)
		})
		.then(
			function() {
					console.log("__FINISHED__")
			}
		)
}