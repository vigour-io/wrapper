##LG - WebOsTv

###How to run the build ?

In order to build for webOsTv, you will need to install the proper LG SDK. The current working sdk is available on this [link](http://developer.lge.com/webOSTV/sdk/web-sdk/sdk-installation).

If you want to read more about the SDK content, [please check this link](http://developer.lge.com/webOSTV/sdk/web-sdk/webos-tv-cli/using-webos-tv-cli)

Unfortunatelly the SDK is no available on npm, so it cannot be added as a dependecy on the project. Once you have it installed, you can continue the steps bellow.

- Add the needed info on the project packege.json.

- run `npm run webostv`.

You can find the files on the 'Build' folder.



###How to test the app on the TV ?

The Tv needs only the IPK file, basically this IPK contains everything, it works like a ZIP file.

After generate the IPK file by running `npm run webostv` command, you can follow this tutorial that explains how to run the app on the [TV](http://developer.lge.com/webOSTV/develop/web-app/app-test/)


###What is the build output ?

The Output build must always contain:

- appinfo.json 
- IPK file

  

###What is needed for app submition ?

- IPK file.
- LG account.

