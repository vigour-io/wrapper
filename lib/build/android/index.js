var path = require('path')
var Promise = require('promise')
var log = require('npmlog')

var tasks = require('./tasks.js')

module.exports = exports = function (opts, shared) {
  log.info('- start android build -')
  return Promise.resolve(opts)
    .then(configure)
    .then(tasks.installTemplate)
    .then(shared.copyAssets)
    .then(tasks.installPlugins)
    .then(tasks.assembleDebug)
    .then(tasks.optionalRun)
    .then(function () {
      log.info('- end android build -')
      return true
    })
    .catch(shared.handleErrors('android'))
}

function configure (opts) {
  var error
  var options = opts.native.platforms.android
  if (!process.env.ANDROID_HOME) {
    error = new Error('Missing environment variable')
    error.requireEnvVar = 'ANDROID_HOME'
    return Promise.reject(error)
  } else if (!options.packageName) {
    error = new Error('Missing configuration')
    error.requiredConfig = 'vigour.native.platforms.android.packageName'
    return Promise.reject(error)
  } else {
    options.root = opts.native.root
    options.sdkDir = process.env.ANDROID_HOME
    options.templateSrc = path.join(__dirname, '..', '..', '..', 'templates', 'android')
    options.buildDir = path.join(options.root, 'build', 'android')
    options.srcDir = path.join(options.buildDir, 'app', 'src', 'main')
    options.outputDir = path.join(options.buildDir, 'app', 'build', 'outputs', 'apk')
    options.apkName = path.join(options.outputDir, 'app-debug.apk')
    options.wwwDst = path.join(options.buildDir, 'app', 'src', 'main', 'assets')
    options.aarDir = path.join(options.buildDir, 'app', 'libs')
    options.adbPath = path.join(options.sdkDir, 'platform-tools', 'adb')
    options.packer = opts.packer
    return options
  }
}
