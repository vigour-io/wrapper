//
//  AppDelegate.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 06/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//


import UIKit
import VigourCore

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    
    func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool {

        /** -- PLACEHOLDER FOR PLUGIN GENERATING CODE -- **/


        VigourPluginManager.registerPlugin(Logger.self)
        VigourPluginManager.registerPlugin(Facebook.self)
        VigourPluginManager.registerPlugin(Env.self)
        VigourPluginManager.registerPlugin(StatusBar.self)
        VigourPluginManager.registerPlugin(Orientation.self)
        VigourPluginManager.registerPlugin(Purchase.self)
        VigourPluginManager.registerPlugin(Chromecast.self)
        VigourPluginManager.registerPlugin(Open.self)
      
        FBSDKApplicationDelegate.sharedInstance().application(application, didFinishLaunchingWithOptions: launchOptions)
        
        return true
    }
    
    /** -- PLACEHOLDER FOR PLUGIN GENERATING CODE -- **/
    func application(application: UIApplication, openURL url: NSURL, sourceApplication: String?, annotation: AnyObject) -> Bool {
        return FBSDKApplicationDelegate.sharedInstance().application(application, openURL: url, sourceApplication: sourceApplication, annotation: annotation)
    }

    
}

