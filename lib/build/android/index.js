var fs = require('vigour-fs')
  , ncp = require('ncp')
  , path = require('path')
  , Promise = require('promise')
  , proc = require('child_process')
  , log = require('npmlog')
  , spawn = proc.spawn
  , cp = require('fs-sync').copy
  , browserify = require('browserify')

  // fns that return promises
  , _mkdir = Promise.denodeify(fs.mkdirp)
  , _ncp = Promise.denodeify(ncp)

module.exports = exports = function (opts) {
  log.info('- start android build -')
  return configure(opts)
    .then(installTemplate)
    .then(installWebApp)
    .then(assembleDebug)
    .then(install)
    .then(run)
    .then(function() {
      log.info('- end android build -')
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
    cp(path.join(opts.wwwSrc, file)
      , path.join(opts.wwwDst, file)
      , { force:true })
  })
  return opts
}

function assembleDebug (opts) {
  log.info("start assembleDebug")
  return exe('./gradlew assembleDebug', opts.buildDir)
    .then(function () {
      return opts
    })
}

function install (opts) {
  log.info("start install")
  return exe(opts.adbPath + ' install -r ' + opts.apkName, opts.outputDir)
    .then(function () {
      return opts
    })
}

function run (opts) {
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
    call.stdout.on('data', function (data) {
      process.stdout.write(data)
    });

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
      console.log(' ? copy: ' + filename + ' - ' + relFilename)
      var stats = fs.statSync(filename)
      if (stats.isDirectory()) {
        if ( ~filename.indexOf('.idea') 
           || ~filename.indexOf('.gradle') 
           || ~filename.indexOf('build') ) {
          console.log('   no: stupid dir')
          return false
        } else {
          console.log('   yes: dir')
          return true
        }
      }
      
      var dstPath = path.join(dst, relFilename)
      if (!fs.existsSync(dstPath)) {
        console.log('   yes: not exists')
        return true
      }
      var dstStats = fs.statSync(dstPath)
      if (stats.mtime > dstStats.mtime) {
        log.info('   yes: ', stats.mtime + ' > ' + dstStats.mtime)
        return true
      }
      console.log('   no: already there')
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