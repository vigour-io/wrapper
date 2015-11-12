#core library for vigour Android plugins

This project is a java lib that provides the classes needed to create (or use) a plugin.

The simplest way to create a plugin is to subclass `Plugin`: all public methods will be callable from javascript by name.

See the [parent](..) folder for a description of the build process.

## Build
Build this project by running

```bash
./gradlew publishToMavenLocal
```

in order to ship this to the local Maven repositories. Other Android plugins
will be relying on the `io.vigour.plugin.core`.
