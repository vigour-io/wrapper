var fs = require('vigour-fs')
  , ncp = require('ncp')
  , path = require('path')
  , Promise = require('promise')
  , proc = require('child_process')
  , log = require('npmlog')
  , exec = proc.exec

  // vars
  , workingDir = process.cwd()
  , localBuildDir = path.join(workingDir, 'build', 'android')
  , androidOutputDir = path.join(localBuildDir, 'app', 'build', 'outputs', 'apk')

  // fns that return promises
  , _mkdir = Promise.denodeify(fs.mkdirp)
  , _ncp = Promise.denodeify(ncp)

function exe (command, cwd) {
  return new Promise(function(fulfill, reject) {
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
              reject(error)
              return
            }
            fulfill()
          })
  })
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

/////////////////////////////////////////////
// android commands
/////////////////////////////////////////////

function assembleDebug() {
  return exe('./gradlew assembleDebug', localBuildDir) 
}
function install() {
  return exe('adb install -r ' + packageName, androidOutputDir) 
}
function run() {
  return exe('adb shell monkey -p ' + packageName + ' 1', '')
}

function compile() {
  console.log("Compiling")
  var packageName = 'io.vigour.cloudandroidwrapper'
  return assembleDebug()
           .then(install)
           .then(run)
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