var fs = require('vigour-fs')
  , ncp = require('ncp')
  , path = require('path')
  , Promise = require('promise')
  , proc = require('child_process')
  , exec = proc.exec

  // vars
  , workingDir = process.cwd()
  , localBuildDir = path.join(workingDir, 'build', 'android')
  , androidOutputDir = path.join(localBuildDir, 'app', 'build', 'outputs', 'apk')

  // fns that return promises
  , _mkdir = Promise.denodeify(fs.mkdirp)
  , _ncp = Promise.denodeify(ncp)
  , _exe = makePromising(exe)

function exe (command, cwd, cb) {
  log.info('Executing', command)
  if (cwd === '') {
    cwd = process.cwd()
  }
  log.info('in', cwd)
  exec( command
      , { cwd: cwd
        , maxBuffer: 1024 * 500
        }
      , function (error, stdout, stderr) {
          if (error) {
            log.error('Error executing ' + command, error)
            return
          }
          // log.info('stdout', stdout)
          log.error('stderr', stderr)
          // log.info('command succeeded')
          cb()
        })
}

function makePromising(fn) {
  return function() {
    var args = Array.prototype.slice.call(arguments)
    function cb(err) {
      if (err) {
        reject(err)
        return
      }
      resolve()
    }
    args.push(cb)
    return new Promise(function (resolve, reject) {
                         Function.prototype.apply(fn, args)
                       })
  }
}

function installTemplate() {
  // if(!fs.existsSync('build/android')) {
    console.log('- Copying android template')
    var src = path.join(__dirname, '..', '..', 'templates', 'android')
      
    console.log("from", src)
    console.log("to", workingDir)
    return _mkdir(workingDir)
      .then(function () {
        _ncp(src
          , workingDir
          , {clobber: true})
      })
      .catch(function (reason) {
        console.error("couldn't copy template: ", reason)
      })
}

function compile() {
  console.log("Compiling (coming soon)")
  var packageName = 'io.vigour.cloudandroidwrapper'
  _exe('./gradlew assembleDebug', localBuildDir)
    .then(_exe('adb install -r ' + packageName, androidOutputDir))
    .then(_exe('adb shell monkey -p ' + packageName + ' 1', ''))
  return true;
}

module.exports = exports = {}
exports.build = function() {
  console.log('start android build')
  return installTemplate()
    .then(compile)
    .then(console.log('end android build'))
    .catch(function(reason) {
        console.error(reason)
    })
}