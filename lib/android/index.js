var fs = require('vigour-fs')
  , ncp = require('ncp')
  , path = require('path')
  , Promise = require('promise')
  , proc = require('child_process')
  , log = require('npmlog')
  , spawn = proc.spawn

  // vars
  , workingDir = process.cwd()
  , localBuildDir = path.join(workingDir, 'build', 'android')
  , androidOutputDir = path.join(localBuildDir, 'app', 'build', 'outputs', 'apk')
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
    log.info('created call', fnName, args)
    call.stdout.on('data', function (data) {
      process.stdout.write(data)
    });

    call.stderr.on('data', function (data) {
      process.stderr.write(data)
    });

    call.on('close', function(code) {
                        log.info('call done', command, code)
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
    console.log('- Copying android template')
    var src = path.join(__dirname, '..', '..', 'templates', 'android')
      
    console.log("from", src)
    console.log("to", localBuildDir)
    return _mkdir(localBuildDir)
      .then(function () {
        _ncp(src
          , localBuildDir
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
  log.info("start assembleDebug")
  return exe('./gradlew assembleDebug', localBuildDir) 
}
function install() {
  log.info("start install")
  return exe('adb install -r ' + packageName, androidOutputDir) 
}
function run() {
  log.info("start run")
  return exe('adb shell monkey -p ' + packageName + ' 1', '')
}

function compile() {
  console.log("Compiling")
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