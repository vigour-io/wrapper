//
//  Env.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 03/12/15.
//  Copyright © 2015 RxSwift. All rights reserved.
//

import Foundation

extension UIDevice {
    
    var modelName: String {
        var systemInfo = utsname()
        uname(&systemInfo)
        let machineMirror = Mirror(reflecting: systemInfo.machine)
        let identifier = machineMirror.children.reduce("") { identifier, element in
            guard let value = element.value as? Int8 where value != 0 else { return identifier }
            return identifier + String(UnicodeScalar(UInt8(value)))
        }
        
        switch identifier {
        case "iPod5,1":                                 return "iPod Touch 5"
        case "iPod7,1":                                 return "iPod Touch 6"
        case "iPhone3,1", "iPhone3,2", "iPhone3,3":     return "iPhone 4"
        case "iPhone4,1":                               return "iPhone 4s"
        case "iPhone5,1", "iPhone5,2":                  return "iPhone 5"
        case "iPhone5,3", "iPhone5,4":                  return "iPhone 5c"
        case "iPhone6,1", "iPhone6,2":                  return "iPhone 5s"
        case "iPhone7,2":                               return "iPhone 6"
        case "iPhone7,1":                               return "iPhone 6 Plus"
        case "iPhone8,1":                               return "iPhone 6s"
        case "iPhone8,2":                               return "iPhone 6s Plus"
        case "iPad2,1", "iPad2,2", "iPad2,3", "iPad2,4":return "iPad 2"
        case "iPad3,1", "iPad3,2", "iPad3,3":           return "iPad 3"
        case "iPad3,4", "iPad3,5", "iPad3,6":           return "iPad 4"
        case "iPad4,1", "iPad4,2", "iPad4,3":           return "iPad Air"
        case "iPad5,3", "iPad5,4":                      return "iPad Air 2"
        case "iPad2,5", "iPad2,6", "iPad2,7":           return "iPad Mini"
        case "iPad4,4", "iPad4,5", "iPad4,6":           return "iPad Mini 2"
        case "iPad4,7", "iPad4,8", "iPad4,9":           return "iPad Mini 3"
        case "iPad5,1", "iPad5,2":                      return "iPad Mini 4"
        case "iPad6,7", "iPad6,8":                      return "iPad Pro"
        case "AppleTV5,3":                              return "Apple TV"
        case "i386", "x86_64":                          return "Simulator"
        default:                                        return identifier
        }
    }
    
}

enum VigourEnvMethod: String {
    case Init="init"
}

class Env: VigourPluginProtocol {
    
    static let sharedInstance = Env()
    
    static let pluginId = "env"
    
    weak var delegate: VigourViewController?
    
    private var reachability: Reachability?
    
    init() {
        
        do {
            reachability = try Reachability.reachabilityForInternetConnection()
        } catch {
            #if DEBUG
            print("Unable to create Reachability")
            #endif
        }

    }
    
    deinit {
         if let r = reachability {
            r.stopNotifier()
        }
    }
    
    static func instance() -> VigourPluginProtocol {
        return Env.sharedInstance
    }
    
    func callMethodWithName(name: String, andArguments args:NSDictionary?, completionHandler:pluginResult) throws {
        if let method = VigourEnvMethod(rawValue: name) {
            switch method {
            case .Init:
                
                //get initial info
                let js = getInfo()
                
                //start scan for updates
                startReachability()
                
                completionHandler(nil, js)
                

            }
        }
    }
    
    func onReady() throws -> JSObject {
        return JSObject([Env.pluginId:"ready"])
    }
    
    //MARK: - Private
    
    private func startReachability() {
        
        if let r = reachability {
            
            //scan on bg thread, send message to js will be on main thread
            r.whenReachable = { status in
                status.currentReachabilityString
            }
            
            r.whenUnreachable = { status in
                status.currentReachabilityString
            }
            
            do {
                try r.startNotifier()
            } catch {
                print("Unable to start notifier")
            }
        }
    }
    
    private func getInfo() -> JSObject {
        var jsObject = [String:NSObject]()
        if let r = reachability {
            jsObject["network"] = r.currentReachabilityString
        }
        else {
            jsObject["network"] = "connection info n/a"
        }
        jsObject["bundleId"] = NSBundle.mainBundle().bundleIdentifier
        jsObject["country"] =  NSLocale.currentLocale().objectForKey(NSLocaleCountryCode) as? String ?? ""
        jsObject["language"] = NSLocale.currentLocale().objectForKey(NSLocaleLanguageCode) as? String ?? ""
        jsObject["region"] = NSLocale.currentLocale().objectForKey(NSLocaleCountryCode) as? String ?? ""
        jsObject["timezone"] = NSTimeZone.localTimeZone().localizedName(NSTimeZoneNameStyle.Generic, locale: NSLocale.currentLocale())
        jsObject["model"] = UIDevice.currentDevice().modelName
        jsObject["os"] = UIDevice.currentDevice().systemName
        jsObject["osVersion"] = UIDevice.currentDevice().systemVersion
        jsObject["appVersion"] = NSBundle.mainBundle().objectForInfoDictionaryKey("CFBundleShortVersionString") as? String ?? ""
        jsObject["build"] = NSBundle.mainBundle().infoDictionary!["CFBundleVersion"] as? String ?? ""
        
        return JSObject(jsObject)
    }
}