'use strict'

var log = require('npmlog')
var path = require('path')
var Promise = require('promise')
var fs = require('vigour-fs/lib/server')
var readJSON = Promise.denodeify(fs.readJSON)
var editXML = Promise.denodeify(fs.editXML)

module.exports = exports = function () {
  if (this.builds) {
    var self = this
    var pluginInfoList = []
    log.info('- installing plugins -')
    for (var pluginName in this.plugins) {
      log.info(pluginName, this.plugins[pluginName].android)
    }

    function buildAllPlugins () {
      function retrievePluginInfo (pluginPath) {
        // log.info('pluginPath', pluginPath)
        return readJSON(path.join(pluginPath, 'package.json'))
          .then(function (pluginOpts) {
            // log.info('loaded', pluginOpts)
            pluginOpts.vigour.plugin.name = pluginOpts.name
            pluginOpts = pluginOpts.vigour.plugin
            log.info('pluginOpts', pluginOpts)
            pluginInfoList.push(pluginOpts)
            return pluginOpts
          })
      }

      var pluginsArr = []
      var aPlugin
      for (var key in self.plugins) {
        aPlugin = self.plugins[key]
        aPlugin.name = key
        pluginsArr.push(aPlugin)
      }

      return pluginsArr.reduce(function (prev, plugin) {
        return prev.then(function () {
          // log.info('  installing plugin: ', plugin)
          return Promise.resolve(plugin.rootPath)
            .then(retrievePluginInfo)
        })
      }, Promise.resolve())
    }

    function installIntoTemplate () {
      var Template = require('./template')
      var template = new Template()

      function injectJava (imports, instantiations) {
        // get the java file and inject instantiations
        log.info('  inject into java')
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
        return Promise.resolve()
      }

      function injectGradle (pluginInfoList) {
        log.info('  inject into build.gradle')
        // insert into gradle
        template.readFile(path.join(self.buildDir, 'app/build.gradle'))
        // template.log()
        template.goto(new RegExp('-- start plugin dependencies'))
        pluginInfoList.forEach(function (info) {
          if (info.android.skipInstall) {
            return
          }
          var pluginName = 'plugin-' + info.name.replace('vigour-', '')
          var line = '' +
            "    compile ('io.vigour:" + pluginName + ":+') {\n" +
            '      transitive=true\n' +
            "      exclude module: 'core'\n" +
            '    }'
          template.insertLine(line)
          log.info(line)
        })
        // template.log()
        template.save()
        return Promise.resolve()
      }

      function injectManifest (permissions, metadata, activities) {
        log.info('inject manifest')
        // get the Manifest and inject permissions
        var manifestPath = path.join(self.buildDir, 'app/src/main/AndroidManifest.xml')
        return editXML(manifestPath, function (xml) {
          // log.info('xml before', JSON.stringify(xml.manifest, null, ' '))

          xml.manifest['uses-permission'].forEach(function (permXml) {
            log.info('xml perm', permXml.$['android:name'])
          // make a set of permissions and replace the permissions
          })

          var application = xml.manifest.application[0]
          activities.forEach(function (activity) {
            application.activity.push({'$': activity})
          })
          if (metadata && metadata.constructor === Array && metadata.length > 0 && !application['meta-data']) {
            application['meta-data'] = []
          }
          metadata.forEach(function (metadataItem) {
            application['meta-data'].push({'$': metadataItem})
          })
          // log.info('xml after', JSON.stringify(xml.manifest, null, ' '))
          return xml
        })
      }

      function injectStrings (strings) {
        log.info('inject strings')
        // edit or add strings
        var manifestPath = path.join(self.buildDir, 'app/src/main/res/values/strings.xml')
        return editXML(manifestPath, function (xml) {
          // log.info('strings before', JSON.stringify(xml, null, ' '))
          var allStrings = {}
          xml.resources.string.forEach(function (s) {
            // log.info('existing: ', s)
            allStrings[s.$.name] = s
          })
          strings.forEach(function (s) {
            // log.info('s', s)
            // todo prevent doubles!!
            for (var key in s) {
              allStrings[key] = {'_': s[key], '$': {'name': key}}
            }
          })
          xml.resources.string = Object.keys(allStrings).map(function (key) {
            return allStrings[key]
          })
          // log.info('strings after', JSON.stringify(xml, null, ' '))
          return xml
        })
      }

      log.info('  installIntoTemplate')
      var imports = []
      var instantiations = []
      var permissions = []
      var activities = []
      var metadata = []
      var strings = []

      // gather info
      pluginInfoList.forEach(function (info) {
        // log.info('plugin info: ', info)
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
        if (info.android.metadata) {
          metadata.push(info.android.metadata)
        }
        if (info.android.activity) {
          activities.push(info.android.activity)
        }
        if (info.android.strings) {
          strings.push(info.android.strings)
        }
      })

      return Promise.all([
        injectJava(imports, instantiations),
        injectManifest(permissions, metadata, activities),
        injectGradle(pluginInfoList),
        injectStrings(strings)
      ])
    }

    if (self.plugins) {
      // log.info('plugins: ', this.plugins)
      return buildAllPlugins()
        .then(installIntoTemplate)
    } else {
      return Promise.resolve()
    }
  } else {
    log.info('- skipping installing plugins -')
  }
}
