var fs = require('vigour-fs')
  , ncp = require('ncp')
  , path = require('path')
  , Promise = require('promise')
  , proc = require('child_process')
  , spawn = proc.spawn
  , log = require('npmlog')
  , readFile = fs.readFileSync

  // fns that return promises
  , _mkdir = Promise.denodeify(fs.mkdirp)
  , _ncp = Promise.denodeify(ncp)

module.exports = exports = function (opts, shared) {
  log.info('- start android build -')
  return Promise.resolve(opts)
    .then(configure)
    .then(installTemplate)
    .then(shared.copyAssets)
    .then(installPlugins)
    .then(assembleDebug)
    .then(optionalRun)
    .then(function() {
      log.info('- end android build -')
      return true
    })
    .catch(shared.handleErrors('android'))
}

function configure (opts) {
  var error
  var options = opts.native.platforms.android
  if (!process.env.ANDROID_HOME) {
    error = new Error("Missing environment variable")
    error.requireEnvVar = "ANDROID_HOME"
    return Promise.reject(error)
  } else if (!options.packageName) {
    error = new Error("Missing configuration")
    error.requiredConfig = "vigour.native.platforms.android.packageName"
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

function installTemplate (opts) {
  // if(!fs.existsSync('build/android')) {
  log.info('- copying android template -')
  
  log.info("  from", opts.templateSrc)
  log.info("  to", opts.buildDir)
  return _mkdir(opts.buildDir)
    .then(function () {
      // TODO fix ncp
      return _ncp(opts.templateSrc
                 , opts.buildDir
                 , { clobber: true 
                   , filter: createCopyFilter(opts.templateSrc, opts.buildDir)
                   })
    })
    // NOTE there is a bug in ncp regarding the filter and it's internal reference counter
    // ncp calls the callback too early and then the rest of our script can fail
    // so we wait 100 millis
    .then(function() {
      log.info('start waiting')
      return new Promise(function(resolve, reject) {
        setTimeout(function () {
         log.info('done waiting')
         resolve()
       }, 100)
      })
    })
    .then(function () {
      log.info('copy done')
      return opts
    })
}

function installPlugins (opts) {
  var pluginPath
    , pluginInfoList = []

  function Template() {
    this.filename = 
    this.contents = []
    this.currentLine = 0
  }

  Template.prototype.readFile = function(filename) {
    this.filename = filename
    this.contents = fs.readFileSync(filename, {encoding: 'utf8'}).split('\n')
    this.currentLine = 0
  }

  Template.prototype.save = function() {
    log.info('save to', this.filename)
    fs.writeFileSync(this.filename, this.contents.join('\n'))
  }

  /** set the currentLine directly after the first occurence of pattern. */
  Template.prototype.goto = function(pattern) {
    for (var i = 0 ; i < this.contents.length ; i++ ) {
      if (this.contents[i].match(pattern)) {
        this.currentLine = i+1
      }
    } 
  }

  Template.prototype.insertLine = function(line) {
    this.contents.splice(this.currentLine, 0, line)
    this.currentLine++
  }

  Template.prototype.commentLine = function(line) {
    this.contents[this.currentLine] = '//' + this.contents[this.currentLine]
    this.currentLine++
  }

  Template.prototype.log = function() {
    log.info('logging:')
    log.info(this.contents.join('\n'))
  }

  function retrievePluginInfo(pluginPath) {
    return new Promise(function (resolve, reject) 
    {
      // log.info("  retrievePluginInfo")
      var packageName = readFile(path.join(pluginPath, "package.json"))
      var opts = JSON.parse(packageName)
      opts.plugin.name = opts.name
      opts = opts.plugin
      // log.info(opts)
      pluginInfoList.push(opts)
      resolve(opts)
    })
  }

  function buildAar(pluginOpts) {
    return new Promise(function (resolve, reject) 
    {
      try {
        log.info("  build aar")
        var androidPath = path.join(opts.root, 'node_modules', pluginOpts.name, 'native', 'android')
          , filename = pluginOpts.id + '-debug'
          , output = path.join(androidPath, filename + '.aar')
          , script = path.join(androidPath, 'build.js')
        pluginOpts.aarFilename = filename
        pluginOpts.aarPath = output
        if ( (!fs.existsSync(output) || opts.rebuildPlugins)
             && fs.existsSync(script) 
             ) {
          exe(script, '')
          .then(function() {
            resolve(pluginOpts)
          })
          .catch(function(e) {
            reject(e)
          })
        } else {
          resolve(pluginOpts)
        }
      } catch(e) {
        reject(e)
      }
    })
  }

  function copyPluginAar(pluginOpts) {
    return new Promise(function (resolve, reject) 
    {
      try {
        var dst = path.join(opts.aarDir, pluginOpts.aarFilename + ".aar")
        log.info('copy', pluginOpts.aarPath, ' --> ', dst)
        fs.writeFileSync(dst, fs.readFileSync(pluginOpts.aarPath))
        resolve(pluginOpts)
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
      pluginInfoList.forEach(function(info) {
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
      var template = new Template()
      template.readFile(path.join(opts.srcDir, 'java/io/vigour/nativewrapper/MainActivity.java'))
      template.goto(new RegExp('-- start plugin imports'))

      imports.forEach(function (s) {
        var line = 'import ' + s + ';'
        template.insertLine(line)
        log.info(line)
      })

      template.goto(new RegExp('private void registerPlugins'))
      instantiations.forEach(function (s) {
        var line = '        pluginManager.register(' + s + ');'
        template.insertLine(line)
        log.info(line)
      })
      template.save()
      // template.log()

      // get the Manifest and inject permissions
      // TODO implement this
      log.info('  inject into AndroidManifest')
      permissions.forEach(function (s) {
        log.info('  <uses-permission android:name="android.permission.' + s + '" />')
      })

      // insert into gradle
      template.readFile(path.join(opts.buildDir, 'app/build.gradle'))
      // template.log()
      template.goto(new RegExp('-- start plugin dependencies'))
      log.info('  inject into build.gradle')
      pluginInfoList.forEach(function (info) {
        var line = '  compile(name:\'' + info.aarFilename + '\', ext:\'aar\')'
        template.insertLine(line)
        log.info(line)
      })
      template.commentLine()
      template.log()
      template.save()

      // done!
      resolve()
    })
  }

  if (!opts.plugins) {
    return opts
  } else {
    return opts.plugins.reduce(function (prev, pluginName) {
      return prev.then(function () {
        return new Promise(function (resolve, reject) {
          // log.info('  installing plugin: ', pluginName)
          pluginPath = path.join(opts.root, 'node_modules', pluginName)
          var androidPath = path.join(pluginPath, 'native', 'android')
          // fs.readdirSync(androidPath).forEach(function(filename) {
            // log.info('  found ', filename)
          // })
          var pathPromise = Promise.resolve(pluginPath)
          resolve(pathPromise
                  .then(retrievePluginInfo)
                  .then(buildAar)
                  .then(copyPluginAar)
                 )
        })
      })
    }, Promise.resolve())
        .then(installIntoTemplate)
        .then(function() {
          return opts
        })
  }
}

function assembleDebug (opts) {
  log.info("start assembleDebug")
  command = './gradlew assembleDebug'
          + ' -PverCode=' + opts.versionCode
          + ' -PverName=' + opts.version
          + ' -PandroidAppId=' + opts.packageName
  return exe(command, opts.buildDir)
    .then(function () {
      return opts
    })
}

function optionalRun(opts) {
  if (!opts.run) {
    return opts
  }

  return Promise.resolve(opts)
    .then(installApk)
    .then(runOnDevice)
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
  return exe(opts.adbPath + ' shell monkey -p ' + opts.packageName + ' 1', opts.root)
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
                          reject(code)
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
        log.info('   new: ' + relFilename)
        return true
      }
      var dstStats = fs.statSync(dstPath)
      if (stats.mtime > dstStats.mtime) {
        log.info('   updated: ' + relFilename)
        return true
      }
      if ( relFilename.indexOf('MainActivity.java')>0 
         || relFilename.indexOf(path.join('app','build.gradle'))>0) {
        log.info('   force: ' + relFilename) 
        return true
      }
      return false
    } catch (e) {
      log.info(e)
    }
  }
}


function getTimeStamp(dir, filename) {
  var t = fs.statSync(path.join(dir, filename)).mtime.getTime()
  log.info(t)
  return t
}