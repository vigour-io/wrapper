# How to run native builds

## Android
Don't know what is the best procedure to install the tools needed run builds and emulators, but I installed the following tools:

#### Android Studio
Once installed go to the preferences pane and install the extra stuff as in the images:

###### SDK Platforms
![SDK Platforms](images/studio_sdk_platforms.png?raw=true "Android Studio SDK Platforms")

###### SDK Tools
![SDK Tools](images/studio_tools.png?raw=true "Android Studio SDK Tools")

###### Updates sites
![Updates sites](images/studio_updates.png?raw=true "Android Studio Updates Sites")

#### Android SDK Manager
Also here once installed run it (`android`) and install the following stuff as in the image:

###### Android SDK Manager
![Part 01](images/sdk_manager_01.png?raw=true "SDK Manager Part 01")
![Part 02](images/sdk_manager_02.png?raw=true "SDK Manager Part 02")

#### Environment settings
Now you need to set your `ANDROID_HOME` env variable to your SDK folder, I have mine in `/Users/ninjatux/Library/Android/sdk`.
