var fs = require('vigour-fs')
  , path = require('path')
	, ncp = require('ncp')
	, Promise = require('promise')
	, _mkdir = Promise.denodeify(fs.mkdirp)
	, xcode = require('xcode')
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


function prepare() {
	console.log('- prepare ios template -')
	
	var dst = path.join(process.cwd(), 'build/ios')
	  , src = path.join(__dirname, '..', '..', 'templates', 'ios')

	console.log(typeof src, typeof dst)
	return _mkdir(dst)
	       .then(_ncp( src
	                 , dst
	                 , {clobber: true}))
}

function configureTemplate() {
	
	var projectPath = path.join(process.cwd(), 'build/ios', 'vigour-native/vigour-native.xcodeproj/project.pbxproj')
	var templateProj = xcode.project(projectPath)
	
	templateProj.parse(function (err) {
	    // templateProj.addHeaderFile('foo.h');
	    // templateProj.addSourceFile('foo.m');
	    // templateProj.addFramework('FooKit.framework');
		
			if(err)
				console.log(err)
  
				
	    fs.writeFileSync(projectPath, templateProj.writeSync());
	    console.log('new project written');
	});	
}


module.exports = exports = {}
exports.build = function() {
  console.log('start ios build')
	return prepare()
		.then(console.log('configure template'))
		.then(configureTemplate)
}