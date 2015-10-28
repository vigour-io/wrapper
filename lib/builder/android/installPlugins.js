'use strict'

var log = require('npmlog')
var path = require('path')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')
var readJSON = Promise.denodeify(fs.readJSON)

module.exports = exports = function () {
  var self = this
  var pluginInfoList = []
  log.info('- installing plugins -')
  log.info('plugins', this.plugins)

  function buildAllPlugins () {
    function retrievePluginInfo (pluginPath) {
      // log.info('pluginPath', pluginPath)
      return readJSON(path.join(pluginPath, 'package.json'))
        .then(function (pluginOpts) {
          log.info('loaded', pluginOpts)
          pluginOpts.vigour.plugin.name = pluginOpts.name
          pluginOpts = pluginOpts.vigour.plugin
          log.info(pluginOpts)
          pluginInfoList.push(pluginOpts)
          return pluginOpts
        })
    }

    return self.plugins.reduce(function (prev, plugin) {
      return prev.then(function () {
        log.info('  installing plugin: ', plugin)
        var pluginPath = path.join(self.root, 'node_modules', plugin.name)
        // var androidPath = path.join(pluginPath, 'native', 'android')
        // fs.readdirSync(androidPath).forEach(function(filename) {
        // log.info('  found ', filename)
        // })

        return Promise.resolve(pluginPath)
          .then(retrievePluginInfo)
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
      template.readFile(path.join(self.srcDir, self.mainJavaFile))
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
      template.readFile(path.join(self.buildDir, 'app/build.gradle'))
      // template.log()
      template.goto(new RegExp('-- start plugin dependencies'))
      log.info('  inject into build.gradle')
      pluginInfoList.forEach(function (info) {
        if (info.android.skipInstall) {
          return
        }
        var line = '' +
          "    compile ('io.vigour:plugin-" + info.name + ":+') {\n" +
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

  if (self.plugins) {
    // log.info('plugins: ', opts.plugins)
    return buildAllPlugins()
      .then(installIntoTemplate)
  }
}
