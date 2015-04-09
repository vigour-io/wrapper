var fs = require('vigour-fs')
  , ncp = require('ncp')
  , path = require('path')
  , Promise = require('promise')
  , proc = require('child_process')
  , log = require('npmlog')
  , spawn = proc.spawn
  , cp = require('fs-sync').copy
  , browserify = require('browserify')

  // vars
  , sdkDir = process.env.ANDROID_HOME || "WILLFAIL"
  , adbPath = path.join(sdkDir, 'platform-tools', 'adb')
  , workingDir = process.cwd()
  , localBuildDir = path.join(workingDir, 'build', 'android')
  , androidOutputDir = path.join(localBuildDir, 'app', 'build', 'outputs', 'apk')
  , apkName = path.join(androidOutputDir, 'app-debug.apk')
  , packageName = 'io.vigour.cloudandroidwrapper'

  // fns that return promises
  , _mkdir = Promise.denodeify(fs.mkdirp)
  , _ncp = Promise.denodeify(ncp)

function exe (command, cwd) {
  var args = command.split(' ')
  var fnName = args[0]
  args = args.splice(1, args.length-1)
  return new Promise(function(fulfill, reject) {
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
                          fulfill()
                        } else {
                          reject()
                        }
                      })
  })
}

function installTemplate() {
  // if(!fs.existsSync('build/android')) {
    log.info('- Copying android template')
    var src = path.join(__dirname, '..', '..', 'templates', 'android')
      
    console.log("  from", src)
    console.log("  to", localBuildDir)
    return _mkdir(localBuildDir)
           .then(function () {
             return _ncp(src
               , localBuildDir
               , { clobber: true 
                 , filter: createCopyFilter(src, localBuildDir)
                 }
              )
           })
           .catch(function (reason) {
             console.log('WTF!?!')
             log.error("couldn't copy template: ", reason)
           })
}

function createCopyFilter(src, dst) {
  console.log('creating filter function')
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
    throw 'fuck!'

  }
}


function getTimeStamp(dir, filename) {
  var t = fs.statSync(path.join(dir, filename)).mtime.getTime()
  console.log(t)
  return t
}

function first() {
  return new Promise(function (resolve, reject) {
    resolve()
  })
}

/////////////////////////////////////////////
// android commands
/////////////////////////////////////////////

function assembleDebug() {
  log.info("start assembleDebug")
  return exe('./gradlew assembleDebug', localBuildDir) 
}
function install() {
  log.info("start install")
  return exe(adbPath + ' install -r ' + apkName, androidOutputDir) 
}
function run() {
  log.info("start run")
  return exe(adbPath + ' shell monkey -p ' + packageName + ' 1', '')
}
function installWebApp() {
  return new Promise(function(fulfill, reject) {
    try{
      var b = browserify()
      b.add
      var dst = path.join(localBuildDir, 'app', 'src', 'main', 'assets')
      var src = path.join(workingDir, 'www')
      log.info("copying assets", "to " + dst)
      fs.readdirSync(src).forEach(function(file) {
        cp(path.join(src, file), path.join(dst, file), {force:true})
      })
      fulfill()
    } catch (e) {
      reject(e)
    }
  })
}

////////////////////////////////////////////
// exports
////////////////////////////////////////////

module.exports = exports = {}
exports.build = function() {
  log.info('start android build')
  return first()
    .then(installTemplate)
    .then(installWebApp)
    .then(assembleDebug)
    // .then(install)
    // .then(run)
    .then(function() {log.info('end android build')})
    .catch(function(reason) {
        log.error(reason)
    })
}