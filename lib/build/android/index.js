var fs = require('vigour-fs')
  , ncp = require('ncp')
  , path = require('path')
  , Promise = require('promise')
  , proc = require('child_process')
  , spawn = proc.spawn
  , log = require('npmlog')
  , browserify = require('browserify')
  , cp = require('fs-sync').copy
  , readFile = fs.readFileSync

  // fns that return promises
  , _mkdir = Promise.denodeify(fs.mkdirp)
  , _ncp = Promise.denodeify(ncp)

module.exports = exports = function (opts) {
  log.info('- start android build -')
  return configure(opts)
    .then(installTemplate)
    .then(installWebApp)
    .then(installPlugins)
    .then(assembleDebug)
    .then(installApk)
    .then(runOnDevice)
    .then(function() {
      log.info('- end android build -')
    })
    .catch(function (reason) {
      log.error(reason, reason.stack)
    })
}

function configure (opts) {
  var error
  if (!process.env.ANDROID_HOME) {
    error = new Error("Missing environment variable")
    error.requireEnvVar = "ANDROID_HOME"
    return Promise.reject(error)
  } else if (!opts.platforms.android.packageName) {
    error = new Error("Missing configuration")
    error.requiredConfig = "vigour.native.platforms.android.packageName"
    return Promise.reject(error)
  } else {
    opts.sdkDir = process.env.ANDROID_HOME
    opts.templateSrc = path.join(__dirname, '..', '..', '..', 'templates', 'android')
    opts.buildDir = path.join(opts.root, 'build', 'android')
    opts.outputDir = path.join(opts.buildDir, 'app', 'build', 'outputs', 'apk')
    opts.apkName = path.join(opts.outputDir, 'app-debug.apk')
    opts.wwwSrc = path.join(opts.root, 'www')
    opts.wwwDst = path.join(opts.buildDir, 'app', 'src', 'main', 'assets')
    opts.aarDir = path.join(opts.buildDir, 'app', 'libs')
    opts.adbPath = path.join(opts.sdkDir, 'platform-tools', 'adb')
    return Promise.resolve(opts)  
  }
}

function installTemplate (opts) {
  // if(!fs.existsSync('build/android')) {
  log.info('- copying android template -')
  
  console.log("  from", opts.templateSrc)
  console.log("  to", opts.buildDir)
  return _mkdir(opts.buildDir)
    .then(function () {
      return _ncp(opts.templateSrc
                 , opts.buildDir
                 , { clobber: true 
                   , filter: createCopyFilter(opts.templateSrc, opts.buildDir)
                   })
    })
    .then(function () {
      return opts
    }, function (reason) {
      log.error("couldn't copy template: ", reason)
      throw reason
    })
}

function installWebApp (opts) {
  log.info("copying assets")
  log.info("from", opts.wwwSrc)
  log.info("to", opts.wwwDst)
  fs.readdirSync(opts.wwwSrc).forEach(function(file) {
    cp( path.join(opts.wwwSrc, file)
      , path.join(opts.wwwDst, file)
      , { force:true })
  })
  return opts
}

function installPlugins (opts) {
  var pluginPath
    , pluginList = []

  function buildAar(pluginName) {
    return new Promise(function (resolve, reject) 
    {
      try {
        log.info("  retrievePluginInfo")
        var androidPath = path.join(opts.root, 'node_modules', pluginName, 'native', 'android')
          , output = path.join(androidPath, pluginName + '-debug.js')
          , script = path.join(androidPath, 'build.js')
        if ( (!fs.existsSync(output) || opts.platforms.android.rebuildPlugins)
             && fs.existsSync(script) ) {
          exe(script, '')
          .then(function() {
            resolve(output)
          })
          .catch(function(e) {
            reject(e)
          })
        } else {
          resolve(output)
        }
      } catch(e) {
        reject(e)
      }
    })
  }

  function retrievePluginInfo() {
    return new Promise(function (resolve, reject) 
    {
      log.info("  retrievePluginInfo")
      var packageName = readFile(path.join(pluginPath, "package.json"))
      var pluginOpts = JSON.parse(packageName).plugin
      console.log(pluginOpts)
      pluginList.push(pluginOpts)
      resolve()
    })
  }

  function copyPluginAar(filename) {
    return new Promise(function (resolve, reject) 
    {
      try {
        console.log('copy', filename, ' --> ', opts.aarDir)
        cp( filename
          , opts.aarDir
          , { force:true } )
        resolve()
      } catch(e) {
        reject(e)
      }
    })
  }

  function installIntoTemplate() {
    return new Promise(function (resolve, reject) 
    {
      log.info("  installIntoTemplate")
      var imports = []
        , instantiations = []
        , permissions = []

      // gather info
      pluginList.forEach(function(info) {
        if (info.android.instantiation) {
          instantiations.push(info.android.instantiation)
        }
        if (info.android.className) {
          imports.push(info.android.className)
        }
        if (info.android.permission) {
          permissions.push(info.android.permission)
        }
      })

      // get the java file and inject instantiations
      log.info('  inject into java')
      imports.forEach(function (s) {
        console.log('import ' + s + ';')
      })
      instantiations.forEach(function (s) {
        console.log('        pluginManager.register(' + s + ');')
      })

      // get the Manifest and inject permissions
      log.info('  inject into AndroidManifest')
      permissions.forEach(function (s) {
        console.log('  <uses-permission android:name="android.permission.' + s + '" />')
      })

      // done!
      resolve()
    })
  }

  return opts.plugins.reduce(function (prev, pluginName) {
    return prev.then(function () {
      return new Promise(function (resolve, reject) {
        log.info('  installing plugin: ', pluginName)
        pluginPath = path.join(opts.root, 'node_modules', pluginName)
        var androidPath = path.join(pluginPath, 'native', 'android')
        fs.readdirSync(androidPath).forEach(function(filename) {
          console.log('  found ', filename)
        })
        var pluginBuildScript = Promise.resolve(pluginName)
        console.log('   trying to exe: ',pluginBuildScript)
        resolve(pluginBuildScript
                .then(buildAar)
                .then(copyPluginAar)
                .then(retrievePluginInfo))
      })
    })
  }, Promise.resolve())
      .then(installIntoTemplate)
      .then(function() {
        return opts
      })
}

function assembleDebug (opts) {
  log.info("start assembleDebug")
  return exe('./gradlew assembleDebug', opts.buildDir)
    .then(function () {
      return opts
    })
}

function installApk (opts) {
  log.info("start install")
  return exe(opts.adbPath + ' install -r ' + opts.apkName, opts.outputDir)
    .then(function () {
      return opts
    })
}

function runOnDevice (opts) {
  log.info("start run")
  return exe(opts.adbPath + ' shell monkey -p ' + opts.platforms.android.packageName + ' 1', opts.root)
    .then(function () {
      return opts
    })
}

// HELPERS

function exe (command, cwd) {
  var args = command.split(' ')
  var fnName = args[0]
  args = args.splice(1, args.length - 1)
  return new Promise(function (resolve, reject) {
    log.info('Executing', command)
    if (cwd === '') {
      cwd = process.cwd()
    }
    log.info('in', cwd)
    var call = spawn( fnName , args , { cwd: cwd } )
    // call.stdout.on('data', function (data) {
      // process.stdout.write(data)
    // });

    call.stderr.on('data', function (data) {
      process.stderr.write(data)
    });

    call.on('close', function(code) {
                        if (code === 0) {
                          resolve()
                        } else {
                          reject()
                        }
                      })
  })
}

function createCopyFilter(src, dst) {
  return function(filename)
  {
    try {
      var relFilename = filename.substr(src.length)
      var stats = fs.statSync(filename)
      if (stats.isDirectory()) {
        if ( ~filename.indexOf('.idea') 
           || ~filename.indexOf('.gradle') 
           || ~filename.indexOf('build') ) {
          return false
        } else {
          return true
        }
      }
      
      var dstPath = path.join(dst, relFilename)
      if (!fs.existsSync(dstPath)) {
        console.log('   new: ' + relFilename)
        return true
      }
      var dstStats = fs.statSync(dstPath)
      if (stats.mtime > dstStats.mtime) {
        console.log('   updated: ' + relFilename)
        return true
      }
      return false
    } catch (e) {
      console.log(e)
    }
  }
}


function getTimeStamp(dir, filename) {
  var t = fs.statSync(path.join(dir, filename)).mtime.getTime()
  console.log(t)
  return t
}