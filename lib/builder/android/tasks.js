var log = require('npmlog')
var Promise = require('promise')
var ncp = require('ncp')
var path = require('path')
var fs = require('vigour-fs/lib/server')
var exists = Promise.denodeify(fs.exists)
var readJSON = Promise.denodeify(fs.readJSON)
var writeJSON = Promise.denodeify(fs.writeJSON)
var readFile = Promise.denodeify(fs.readFile)
var editXML = Promise.denodeify(fs.editXML)
var remove = Promise.denodeify(fs.remove)
var imgServer = require('vigour-img')
var getChecksum = require('checksum')

// fns that return promises
var _mkdir = Promise.denodeify(fs.mkdirp)
var _ncp = Promise.denodeify(ncp)

var exe = require('../../exe')
exports.exe = exe

function buildCore (opts) {
  log.info('start building plugincore')
  return exports.exe('./gradlew plugincore:uploadArchives', opts.pluginCoreSrc)
    .then(function () {
      log.info('building plugincore done')
      return opts
    })
}
exports.buildCore = buildCore

function installTemplate (opts) {
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
        // don't remove this code! see other comment!
        setTimeout(function () {
          // don't remove this code! see other comment!
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
  log.info('- customize template -')
  return editXML(path.join(opts.srcDir, 'res', 'values', 'template.xml'),
    function (xml) {
      if (opts.appIndexPath) {
        xml.resources.string[1]._ = opts.appIndexPath
      }
      if (opts.productName) {
        xml.resources.string[0]._ = opts.productName
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

function installImages (opts) {
  log.info('- installing images -')

  var cacheFilename = path.join(opts.buildDir, 'cache.js')
  return exists(cacheFilename)
    .then(function (exists) {
      if (exists) {
        return readJSON(cacheFilename)
      } else {
        return {}
      }
    })
    .then(function (cachedState) {
      // log.info('read image cache', cachedState)

      function upToDate (imPath) {
        return readFile(imPath)
          .then(getChecksum)
          .then(function (sum) {
            var isUpToDate = cachedState[imPath] === sum
            cachedState[imPath] = sum
            return isUpToDate
          })
      }

      var dstBase = path.join(opts.srcDir, 'res')
      var manips = []
      var pending = []
      if (opts.splashScreen) {
        var splashFileName = 'splash.png'
        var src = path.join(opts.root, opts.splashScreen)
        pending.push(upToDate(src)
          .then(function (isUpToDate) {
            if (isUpToDate) {
              log.info('skippin up to date image ' + opts.splashScreen)
            } else {
              manips.push({
                src: src,
                batch: [{
                  dst: path.join(dstBase, 'drawable-xhdpi', splashFileName),
                  width: 960,
                  height: 960,
                  outType: 'png'
                }, {
                  dst: path.join(dstBase, 'drawable-large-xhdpi', splashFileName),
                  width: 2048,
                  height: 2048,
                  outType: 'png'
                }]
              })
            }
          }))
      }

      if (opts.appIcon) {
        var iconFileName = 'ic_launcher.png'
        src = path.join(opts.root, opts.appIcon)
        pending.push(upToDate(src)
          .then(function (isUpToDate) {
            if (isUpToDate) {
              log.info('skippin up to date image ' + opts.appIcon)
            } else {
              manips.push({
                src: path.join(opts.root, opts.appIcon),
                batch: [{
                  dst: path.join(dstBase, 'mipmap-mdpi', iconFileName),
                  width: 48,
                  height: 48,
                  outType: 'png'
                }, {
                  dst: path.join(dstBase, 'mipmap-hdpi', iconFileName),
                  width: 72,
                  height: 72,
                  outType: 'png'
                }, {
                  dst: path.join(dstBase, 'mipmap-xhdpi', iconFileName),
                  width: 96,
                  height: 96,
                  outType: 'png'
                }, {
                  dst: path.join(dstBase, 'mipmap-xxhdpi', iconFileName),
                  width: 144,
                  height: 144,
                  outType: 'png'
                } /*, {
                  dst: path.join(dstBase, 'mipmap-xxxhdpi', iconFileName),
                  width: 192,
                  height: 192
                }*/]
              })
            }
          }))
      }

      return Promise.all(pending)
        .then(function () {
          if (manips.length) {
            // log.info('installing images: ', JSON.stringify(manips))
            return imgServer({
              convertPath: 'forceUseOfRemote',
              manip: manips
            }).then(function () {
              return writeJSON(cacheFilename, cachedState)
            }).then(function () {
              return opts
            })
          } else {
            return opts
          }
        })
    })
}
exports.installImages = installImages

function installPlugins (opts) {
  var pluginInfoList = []

  function buildAllPlugins () {
    function retrievePluginInfo (pluginPath) {
      // log.info('pluginPath', pluginPath)
      return readJSON(path.join(pluginPath, 'package.json'))
        .then(function (pluginOpts) {
          // log.info('loaded', pluginOpts)
          pluginOpts.vigour.plugin.name = pluginOpts.name
          pluginOpts = pluginOpts.vigour.plugin
          log.info(pluginOpts)
          pluginInfoList.push(pluginOpts)
          return pluginOpts
        })
    }

    function buildAar (pluginOpts) {
      return new Promise(function (resolve, reject) {
        try {
          log.info('  build aar')
          var androidPath = path.join(opts.root,
            'node_modules',
            pluginOpts.name,
            'native',
            'android')
          var script = path.join(androidPath, 'build.js')
          exists(script)
            .then(function (exists) {
              try {
                if (exists) {
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
              } catch (e) {
                reject(e)
              }
            })
        } catch (e) {
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
          "    compile ('io.vigour.plugin:" + info.id + ":+') {\n" +
          '      transitive=true\n' +
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
    return buildAllPlugins()
      .then(installIntoTemplate)
      .then(function () {
        return opts
      })
  }
}
exports.installPlugins = installPlugins

function assemble (opts) {
  log.info('start assemble')
  var buildType = opts.debug ? 'assembleDebug' : 'assembleRelease'
  var command = './gradlew ' + buildType +
    ' -PverCode=' + opts.versionCode +
    ' -PverName=' + opts.version +
    ' -PandroidAppId=' + opts.applicationId

  if (!opts.debug && opts.keystorePassword) {
    command += ' -PRELEASE_STORE_PASSWORD=' + opts.keystorePassword
  }
  if (!opts.debug && opts.keystoreAlias) {
    command += ' -PRELEASE_KEY_ALIAS=' + opts.keystoreAlias
  }
  if (!opts.debug && opts.keystoreKeyPassword) {
    command += ' -PRELEASE_KEY_PASSWORD=' + opts.keystoreKeyPassword
  }

  return Promise.resolve()
    .then(function () {
      if (opts.keystoreFile) {
        var srcPath = path.join(opts.root, opts.keystoreFile)
        var dstPath = path.join(opts.moduleDir, 'release.keystore')
        log.info('copy keystore file from: ' + srcPath + ' to ' + dstPath)
        return Promise.resolve(srcPath)
          .then(readFile)
          .then(function (file) {
            return fs.writeFile(dstPath, file)
          })
      } else {
        return Promise.resolve()
      }
    })
    .then(function () {
      return exports.exe(command, opts.buildDir)
    })
    .then(function () {
      return opts
    })
}
exports.assemble = assemble

function run (opts) {
  function installApk (opts) {
    log.info('start install')
    var apkName = opts.apkNameBase + (opts.debug ? '-debug.apk' : '-release.apk')
    return exports.exe(opts.adbPath + ' install -r ' + apkName, opts.outputDir)
      .then(function () {
        return opts
      })
  }

  function runOnDevice (opts) {
    log.info('start run')
    return exports.exe(opts.adbPath + ' shell monkey -p ' + opts.applicationId + ' 1',
      opts.root)
      .then(function () {
        return opts
      })
  }

  if (!opts.run) {
    return opts
  }

  return Promise.resolve(opts)
    .then(installApk)
    .then(runOnDevice)
}
exports.run = run

// HELPERS
