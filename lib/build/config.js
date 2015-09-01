var path = require('path')
var version = require('../../package.json').version
var config = module.exports = exports = {}

config.version = version

config.items = {
  'vigour.native.platforms.samsungtv.url': {
    def: null,
    cli: '--url <url>',
    desc: 'URL to load on app start'
  },
  'vigour.native.platforms.samsungtv.main': {
    def: null,
    cli: '-m, --main <path>',
    desc: 'path to the build.js to include in the build'
  },
  'vigour.native.platforms.samsungtv.mainHtml': {
    def: null,
    cli: '--mainHtml <path>',
    desc: 'path to the build.html to include in the build'
  },
  'vigour.native.selectedPlatforms': {
    def: null,
    env: 'VNATIVE_PLATFORMS',
    cli: '-p, --platforms <platformList>',
    desc: 'Comma-separated list of platforms to build (builds all by default)'
  },
  'vigour.native.root': {
    def: process.cwd(),
    env: 'VNATIVE_ROOT',
    cli: '--root <path>',
    desc: 'Path to the root directory of the project to be built'
  },
  'vigour.native.platforms.android.version': {
    def: '1.0.0',
    env: 'VNATIVE_VERSION',
    cli: '--android-version <semver>',
    desc: 'version (semver) to be used for the android apk'
  },
  'vigour.native.platforms.android.versionCode': {
    def: 1,
    env: 'VNATIVE_VERSIONCODE',
    cli: '--android-versionCode <int>',
    desc: 'version code (integer) to be used for the andriod apk'
  },
  'vigour.native.platforms.android.appIndexPath': {
    def: 'src/index.html',
    cli: '--android-app-index-path <path>',
    desc: 'path of the apps index file'
  },
  'vigour.native.platforms.android.applicationId': {
    def: null,
    cli: '--android-app-id <path>',
    desc: 'the id of the app (as used in the play store)'
  },
  'vigour.native.platforms.android.run': {
    def: null,
    env: 'VNATIVE_ANDROID_RUN',
    cli: '--android-run',
    desc: 'wether to install and launch the build on device'
  },
  'vigour.native.platforms.android.logToFile': {
    def: null,
    cli: '--android-log-to-file',
    desc: "if thruthy the build output is saved to 'android-build.log'"
  },
  'vigour.native.clean': {
    def: null,
    cli: '-x, --clean',
    desc: 'clean before build'
  }
}

config.files = {
  def: path.join(process.cwd(), 'package.json'),
  env: 'VNATIVE_CONFIG_FILES'
}
