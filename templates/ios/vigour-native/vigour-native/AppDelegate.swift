//
//  AppDelegate.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 06/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//

// WKWebView has an issue not able load html files from local disk
// http://openradar.appspot.com/20160687
// https://issues.apache.org/jira/browse/CB-7539
// https://github.com/shazron/WKWebViewFIleUrlTest

// two options to bypass the issue:
//  - user a server like: https://github.com/swisspol/GCDWebServer, https://github.com/robbiehanson/CocoaHTTPServer
//    or https://developer.apple.com/legacy/library/samplecode/CocoaHTTPServer/Listings/CocoaHTTPServer_m.html
// - workaround is to copy www folder to tmp folder in de apps sandbox

import UIKit


let webApplicationRootFolderName = "www"

let webAplicationFolderPath = NSTemporaryDirectory().stringByAppendingString(webApplicationRootFolderName)


@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    
    func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool {

        /** -- PLACEHOLDER FOR PLUGIN GENERATING CODE -- **/
        
        FBSDKApplicationDelegate.sharedInstance().application(application, didFinishLaunchingWithOptions: launchOptions)
        
        copyWWWToTmpFolderIfNeeded(true)
        
        return true
    }

    func applicationWillEnterForeground(application: UIApplication) {
        copyWWWToTmpFolderIfNeeded(false)
    }
    
    func copyWWWToTmpFolderIfNeeded(force: Bool) {
        
        let filemgr = NSFileManager.defaultManager()
        
        if filemgr.fileExistsAtPath(webAplicationFolderPath) && !force {
            return
        }

        //wkwebview fix for referencing to www folder
        copyFolderToFolder(NSBundle.mainBundle().pathForResource("www", ofType: nil)!, destination: webAplicationFolderPath)
    }
    
    /** -- PLACEHOLDER FOR PLUGIN GENERATING CODE -- **/
    func application(application: UIApplication, openURL url: NSURL, sourceApplication: String?, annotation: AnyObject) -> Bool {
        return FBSDKApplicationDelegate.sharedInstance().application(application, openURL: url, sourceApplication: sourceApplication, annotation: annotation)
    }

    
}

