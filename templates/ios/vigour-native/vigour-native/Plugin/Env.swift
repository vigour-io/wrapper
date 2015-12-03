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

struct Env: VigourPluginProtocol {
    
    static let pluginId = "env"
    
    var delegate: VigourViewController?
    
    static func instance() -> VigourPluginProtocol {
        return Env()
    }
    
    func callMethodWithName(name: String, andArguments args:NSDictionary?, completionHandler:pluginResult) throws {
        if let method = VigourFacebookMethod(rawValue: name) {
            switch method {
            case .Init:
                print("CRAPPPP")
            default:break
            }
        }
    }
    
    func onReady() throws -> JSObject {
        return JSObject([Env.pluginId:"ready"])
    }
    
    //MARK: - Private
    
    private func getInfo() {
        let bundleIdentifier = NSBundle.mainBundle().bundleIdentifier
        let country = NSLocale.currentLocale().objectForKey(NSLocaleCountryCode)
        let lang = NSLocale.currentLocale().objectForKey(NSLocaleLanguageCode)
        let timeZone = NSTimeZone.localTimeZone().localizedName(NSTimeZoneNameStyle.Generic, locale: NSLocale.currentLocale())
        let modelName = UIDevice.currentDevice().modelName
    }
}