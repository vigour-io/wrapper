var log = require('npmlog')
var fs = require('vigour-fs')
var ncp = require('ncp')
var proc = require('child_process')
var spawn = proc.spawn
var readFile = fs.readFileSync
var path = require('path')
var Promise = require('promise')
var stat = Promise.denodeify(fs.stat)
var editXML = Promise.denodeify(fs.editXML)
var http = require('http')
var remove = Promise.denodeify(fs.remove)

// fns that return promises
var _mkdir = Promise.denodeify(fs.mkdirp)
var _ncp = Promise.denodeify(ncp)

function installTemplate (opts) {
  // if(!fs.existsSync('build/android')) {
  log.info('- copying android template -')

  log.info('  from', opts.templateSrc)
  log.info('  to', opts.buildDir)

  return (opts.clean
    ? remove(opts.buildDir)
    : Promise.resolve()
    )
    .then(function () {
      return _mkdir(opts.buildDir)
    })
    .then(function () {
      // TODO fix ncp
      return _ncp(opts.templateSrc,
        opts.buildDir,
        { clobber: true,
          filter: createCopyFilter(opts.templateSrc, opts.buildDir)
        })
    })
    // NOTE there is a bug in ncp regarding the filter and it's internal reference counter
    // ncp calls the callback too early and then the rest of our script can fail
    // so we wait 100 millis
    .then(function () {
      log.info('start waiting')
      return new Promise(function (resolve, reject) {
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
exports.installTemplate = installTemplate

function customizeTemplate (opts) {
  return editXML(path.join(opts.srcDir, 'res', 'values', 'template.xml'),
    function (xml) {
      if (opts.appIndexPath) {
        xml.resources.string[0]._ = opts.appIndexPath
      }
      if (opts.productName) {
        xml.resources.string[1]._ = opts.productName
      }
      if (opts.splashDuration) {
        xml.resources.integer[0]._ = opts.splashDuration
      }
      return xml
    })
    .then(function () {
      return opts
    })
}
exports.customizeTemplate = customizeTemplate

function installApk (opts) {
  log.info('start install')
  return exports.exe(opts.adbPath + ' install -r ' + opts.apkName, opts.outputDir)
    .then(function () {
      return opts
    })
}
exports.installApk = installApk

function runOnDevice (opts) {
  log.info('start run')
  return exports.exe(opts.adbPath + ' shell monkey -p ' + opts.applicationId + ' 1',
    opts.root)
    .then(function () {
      return opts
    })
}
exports.runOnDevice = runOnDevice

function optionalRun (opts) {
  if (!opts.run) {
    return opts
  }

  return Promise.resolve(opts)
    .then(installApk)
    .then(runOnDevice)
}
exports.optionalRun = optionalRun

function installPlugins (opts) {
  var pluginInfoList = []

  function buildCore () {
    return exports.exe('./gradlew plugincore:uploadArchives', opts.buildDir)
  }

  function buildAllPlugins () {
    function retrievePluginInfo (pluginPath) {
      return new Promise(function (resolve, reject) {
        // log.info("  retrievePluginInfo")
        var packageFile = readFile(path.join(pluginPath, 'package.json'))
        var opts = JSON.parse(packageFile)
        // log.info('loaded', opts)
        opts.vigour.plugin.name = opts.name
        opts = opts.vigour.plugin
        log.info(opts)
        pluginInfoList.push(opts)
        resolve(opts)
      })
    }

    function buildAar (pluginOpts) {
      return new Promise(function (resolve, reject) {
        try {
          log.info('  build aar')
          var androidPath = path.join(opts.root, 'node_modules',
            pluginOpts.name, 'native', 'android')
          var script = path.join(androidPath, 'build.js')
          if (fs.existsSync(script)) {
            exports.exe(script, '')
              .then(function () {
                resolve(pluginOpts)
              })
              .catch(function (e) {
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

    return opts.plugins.reduce(function (prev, plugin) {
      return prev.then(function () {
        log.info('  installing plugin: ', plugin)
        var pluginPath = path.join(opts.root, 'node_modules', plugin.name)
        // var androidPath = path.join(pluginPath, 'native', 'android')
        // fs.readdirSync(androidPath).forEach(function(filename) {
        // log.info('  found ', filename)
        // })

        return Promise.resolve(pluginPath)
          .then(retrievePluginInfo)
          .then(buildAar)
      })
    }, Promise.resolve())
  }

  function installIntoTemplate () {
    function Template () {
      this.filename =
        this.contents = []
      this.currentLine = 0
    }

    Template.prototype.readFile = function (filename) {
      this.filename = filename
      this.contents = fs.readFileSync(filename, {encoding: 'utf8'}).split('\n')
      this.currentLine = 0
    }

    Template.prototype.save = function () {
      log.info('save to', this.filename)
      fs.writeFileSync(this.filename, this.contents.join('\n'))
    }

    /** set the currentLine directly after the first occurence of pattern. */
    Template.prototype.goto = function (pattern) {
      for (var i = 0; i < this.contents.length; i++) {
        if (this.contents[i].match(pattern)) {
          this.currentLine = i + 1
        }
      }
    }

    Template.prototype.insertLine = function (line) {
      this.contents.splice(this.currentLine, 0, line)
      this.currentLine++
    }

    Template.prototype.commentLine = function (line) {
      this.contents[this.currentLine] = '//' + this.contents[this.currentLine]
      this.currentLine++
    }

    Template.prototype.log = function () {
      log.info('logging:')
      log.info(this.contents.join('\n'))
    }

    return new Promise(function (resolve, reject) {
      log.info('  installIntoTemplate')
      var imports = []
      var instantiations = []
      var permissions = []

      // gather info
      pluginInfoList.forEach(function (info) {
        log.info('plugin info: ', info)
        if (info.android.skipInstall) {
          return
        }
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
      template.readFile(path.join(opts.srcDir, opts.mainJavaFile))
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
        log.info('  <uses-permission android:name="android.permission.' +
          s + '" />')
      })

      // insert into gradle
      template.readFile(path.join(opts.buildDir, 'app/build.gradle'))
      // template.log()
      template.goto(new RegExp('-- start plugin dependencies'))
      log.info('  inject into build.gradle')
      pluginInfoList.forEach(function (info) {
        if (info.android.skipInstall) {
          return
        }
        var line = '' +
          "    compile ('io.vigour.plugin:" + info.id + ":1.0-SNAPSHOT@aar') {\n" +
          "      exclude module: 'core'\n" +
          '    }'
        template.insertLine(line)
        log.info(line)
      })
      // template.log()
      template.save()

      // done!
      resolve()
    })
  }

  if (!opts.plugins) {
    return opts
  } else {
    // log.info('plugins: ', opts.plugins)
    return buildCore()
      // .then(buildAllPlugins)
      .then(installIntoTemplate)
      .then(function () {
        return opts
      })
  }
}
exports.installPlugins = installPlugins

function assembleDebug (opts) {
  log.info('start assembleDebug')
  var command = './gradlew assembleDebug' +
    ' -PverCode=' +
    opts.versionCode +
    ' -PverName=' +
    opts.version +
    ' -PandroidAppId=' +
    opts.applicationId
  return exports.exe(command, opts.buildDir)
    .then(function () {
      return opts
    })
}
exports.assembleDebug = assembleDebug

// HELPERS

function exe_impl (command, cwd) {
  var args = command.split(' ')
  var fnName = args[0]
  args = args.splice(1, args.length - 1)

  return new Promise(function (resolve, reject) {
    log.info('Executing', command)
    if (cwd === '') {
      cwd = process.cwd()
    }
    log.info('in', cwd)
    var call = spawn(fnName, args, { cwd: cwd })
    call.stdout.on('data', function (data) {
      log.stream.write(data)
    })

    call.stderr.on('data', function (data) {
      log.stream.write(data)
    })

    call.on('close', function (code) {
      if (code === 0) {
        resolve()
      } else {
        var error = new Error('failed command')
        error.info = { code: code }
        reject(error)
      }
    })
  })
}
exports.exe = exe_impl

function createCopyFilter (src, dst) {
  return function (filename) {
    try {
      var relFilename = filename.substr(src.length)
      var stats = fs.statSync(filename)
      if (stats.isDirectory()) {
        if (filename.indexOf('.idea') >= 0 ||
          filename.indexOf('.gradle') >= 0 ||
          filename.indexOf('build') >= 0) {
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
      if (relFilename.indexOf('MainActivity.java') > 0 ||
        relFilename.indexOf(path.join('app', 'build.gradle')) > 0) {
        log.info('   force: ' + relFilename)
        return true
      }
      return false
    } catch (e) {
      log.info(e)
    }
  }
}

// exports.setLogStream = function setLogStream (stream) {
//   if (stream) {
//     log.stream = stream
//   } else {
//     log.stream = process.stderr
//   }
// }

function installImages (opts) {
  log.info('- adding native assets using service -')

  var assetPromises = []
  var asset

  // splash LaunchImage.launchimage
  if (opts.splashScreen) {
    asset = {
      img: path.join(opts.root, opts.splashScreen),
      dst: path.join(opts.srcDir, 'res'),
      filename: 'splash.png',
      sizes: [
        {dst: 'drawable-xhdpi', w: 960, h: 960},
        {dst: 'drawable-large-xhdpi', w: 2048, h: 2048}
      ]
    }
    assetPromises[assetPromises.length] = createAsset(asset)
  }

  // app icon AppIcon.appiconset
  if (opts.appIcon) {
    asset = {
      img: path.join(opts.root, opts.appIcon),
      dst: path.join(opts.srcDir, 'res'),
      filename: 'ic_launcher.png',
      sizes: [
        {dst: 'mipmap-mdpi', w: 48, h: 48},
        {dst: 'mipmap-hdpi', w: 72, h: 72},
        {dst: 'mipmap-xhdpi', w: 96, h: 96},
        {dst: 'mipmap-xxhdpi', w: 144, h: 144}
      // {dst: 'mipmap-xxxhdpi', w: 192, h: 192}
      ]
    }
    assetPromises[assetPromises.length] = createAsset(asset)
  }

  return Promise.all(assetPromises).then(function (data) {
    log.info('Assets done')
    return opts
  }).catch(function (e) {
    log.error(e)
  })
}
exports.installImages = installImages

function createAsset (opts) {
  // return new Promise(function (resolve, reject) {
  return Promise.all(opts.sizes.map(function (size) {
    return createImages(opts.img, path.join(opts.dst, size.dst), opts.filename, size.w, size.h)
  }))
// })
}

function createImages (imgPath, dst, filename, w, h) {
  return stat(imgPath).then(function (stats) {
    return new Promise(function (resolve, reject) {
      var rs = fs.createReadStream(imgPath)
      var callPath = ['', 'image', w, h].join('/') + '?cache=false&outType=png'
      log.info('  = image ', imgPath)
      log.info('  = path ', callPath)

      try {
        var req = http.request(
          { path: callPath,
            method: 'POST',
            host: 'img.vigour.io',
            headers: { 'Content-Length': stats.size,
              'Content-Type': 'image/jpeg'
            }
          },
          function (res) {
            res.on('error', function (err) {
              console.error('err', err, err.stack)
              reject(err)
            })
            if (res.statusCode === 200) {
              log.info('  - success, write to ', dst)
              if (!fs.existsSync(dst)) {
                fs.mkdirSync(dst)
              }
              var ws = fs.createWriteStream(path.join(dst, filename))
              res.pipe(ws)
              res.on('error', function (err) {
                log.error(err)
                reject(err)
              })
              res.on('end', function () {
                log.info('  - saved')
                resolve(dst)
              })
            } else {
              res.on('data', function (chunk) {
                log.warn('   - error ', chunk.toString())
              })
              res.on('end', function () {
                reject(res)
              })
            }
          })

        req.on('error', function (err) {
          log.error('e2', err)
          reject(err)
        })

        log.info('  - starting call')
        rs.pipe(req).on('error', function (err) {
          log.error('e3', err)
          reject(err)
        })
      } catch (e) {
        log.error('e1: ', e)
        reject(e)
      }

    })
  })
}
