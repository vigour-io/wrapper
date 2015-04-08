var fs = require('vigour-fs')
  , path = require('path')
	, ncp = require('ncp')
	, Promise = require('promise')
	, _mkdir = Promise.denodeify(fs.mkdirp)
	, xcode = require('xcode')
	, plist = require('plist')
	, _ncp = function() {
  	var args = Array.prototype.slice.call(arguments)
		return new Promise(function(resolve, reject) {
    	try {
      	console.log("args", args)
					args.push(function(err) {
	        if (err) {
	          reject(err)
	        } else {
	          resolve()
	        }
	      })
	      console.log('ncp', args)
	      ncp.apply(this, args)
	    } catch (e) {
	      console.log("Error: ", e, e.stack)
	      reject(e)
	    }
	  })}
	, dst = path.join(process.cwd(), 'build/ios')


function prepare() {
	console.log('- prepare ios template -')
	var src = path.join(__dirname, '..', '..', 'templates', 'ios')

	console.log(typeof src, typeof dst)
	return _mkdir(dst)
	       .then(function(){ return _ncp( src
	                 , dst
	                 , {clobber: true})})
}

function configureTemplate() {
	console.log('configure template')
	var projectPath = path.join(dst, 'vigour-native/vigour-native.xcodeproj/project.pbxproj')
	var templateProj = xcode.project(projectPath)
	
	templateProj.parse(function (err) {
	    // templateProj.addHeaderFile('foo.h');
	    // templateProj.addSourceFile('foo.m');
	    // templateProj.addFramework('FooKit.framework');
		
			if(err)
				console.log(err)
  
				//add framework stuff.. plugins etc.
				templateProj.updateProductName("crap")
				
	    fs.writeFileSync(projectPath, templateProj.writeSync());
	    console.log('new project written');
	});	
}

function modifyPlist(options) {
	var plistPath = path.join(dst, 'vigour-native/vigour-native/Info.plist')
	var plistObject = plist.parse(fs.readFileSync(plistPath, 'utf8'));
	
	var versionNumber = parseInt(plistObject["CFBundleVersion"])
	plistObject["CFBundleVersion"] = '' + ++versionNumber
	console.log(plistObject["CFBundleVersion"])
	console.log(plistObject)
	if(options.platforms.ios.productName) {

	}
	fs.writeFileSync(plistPath, plist.build(plistObject))
	
}


module.exports = exports = {}
exports.build = function(opts) {
  console.log('start ios build')
	return prepare()
		.then(configureTemplate)
		.then(function(){
			console.log('configure project')
			return modifyPlist(opts)
		})
}