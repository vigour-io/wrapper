var path = require('path')
var log = require('npmlog')
var tasks = require('./tasks.js')

module.exports = exports = function (opts, shared) {
  log.info('- start android build -')
  return Promise.resolve(opts)
    .then(configure)
    .then(tasks.buildCore)
    .then(tasks.installTemplate)
    .then(shared.copyAssets)
    .then(tasks.customizeTemplate)
    .then(tasks.installImages)
    .then(tasks.installPlugins)
    .then(tasks.assemble)
    .then(tasks.run)
    .then(function () {
      log.info('- end android build -')
      return true
    })
    .catch(shared.handleErrors('android'))
}

function configure (opts) {
  var error
  var options = opts.vigour.native.platforms.android
  options.clean = opts.vigour.native.clean
  options.debug = opts.vigour.native.debug
  options.plugins = opts.vigour.native.plugins
  if (!process.env.ANDROID_HOME) {
    error = new Error('Missing environment variable')
    error.requireEnvVar = 'ANDROID_HOME'
    throw error
  } else if (!options.applicationId) {
    error = new Error('Missing configuration')
    error.requiredConfig = 'vigour.native.platforms.android.applicationId'
    throw error
  } else {
    options.root = opts.vigour.native.root
    options.sdkDir = process.env.ANDROID_HOME
    options.templateSrc = path.join(__dirname, '..', '..', '..', 'templates', 'android', 'app')
    options.pluginCoreSrc = path.join(__dirname, '..', '..', '..', 'templates', 'android', 'plugincore')
    options.buildDir = path.join(options.root, 'build', 'android')
    options.moduleDir = path.join(options.buildDir, 'app')
    options.srcDir = path.join(options.moduleDir, 'src', 'main')
    options.mainJavaFile = 'java/io/vigour/nativewrapper/MainActivity.java'
    options.outputDir = path.join(options.moduleDir, 'build', 'outputs', 'apk')
    options.apkNameBase = path.join(options.outputDir, 'app')
    options.wwwDst = path.join(options.moduleDir, 'src', 'main', 'assets')
    options.aarDir = path.join(options.moduleDir, 'libs')
    options.adbPath = path.join(options.sdkDir, 'platform-tools', 'adb')
    options.packer = opts.vigour.packer
    options.keystoreKeyPassword = options.keystoreKeyPassword || options.keystorePassword

    return options
  }
}
