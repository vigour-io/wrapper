//
//  Env.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 03/12/15.
//  Copyright © 2015 RxSwift. All rights reserved.
//

import Foundation
import CoreTelephony.CTTelephonyNetworkInfo
import AVFoundation

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

extension CTTelephonyNetworkInfo {
    func standardGrouping(radioAccessTechnology:String) -> String {
        switch radioAccessTechnology {
        case CTRadioAccessTechnologyGPRS: return "2G"
            case CTRadioAccessTechnologyEdge: return "2G"
            case CTRadioAccessTechnologyWCDMA: return "3G"
            case CTRadioAccessTechnologyHSDPA: return "3G"
            case CTRadioAccessTechnologyHSUPA: return "3G"
            case CTRadioAccessTechnologyCDMA1x: return "2G"
            case CTRadioAccessTechnologyCDMAEVDORev0: return "3G"
            case CTRadioAccessTechnologyCDMAEVDORevA: return "3G"
            case CTRadioAccessTechnologyCDMAEVDORevB: return "3G"
            case CTRadioAccessTechnologyeHRPD: return "3G"
            case CTRadioAccessTechnologyLTE: return "4G"
        default: return "unkonwn"
        }
    }
}


enum VigourEnvMethod: String {
    case Init="init"
}

class Env:NSObject, VigourPluginProtocol {
    
    static let sharedInstance = Env()
    
    static let pluginId = "env"
    
    weak var delegate: VigourViewController?
    
    private var reachability: Reachability?
    
    private let notificationCenter = NSNotificationCenter.defaultCenter()
    
    private let telNetworkInfo: CTTelephonyNetworkInfo = CTTelephonyNetworkInfo()
    
    private let audioSession = AVAudioSession.sharedInstance()
    
    override init() {
        
        super.init()

        
        //resign event
        notificationCenter.addObserver(self, selector: Selector("appWillResignActive"), name: UIApplicationWillResignActiveNotification, object: nil)
        
        //will enter foreground
        notificationCenter.addObserver(self, selector: Selector("appwillEnterForeground"), name: UIApplicationWillEnterForegroundNotification, object: nil)
        
        //active event
        notificationCenter.addObserver(self, selector: Selector("appDidBecomeActive"), name: UIApplicationDidBecomeActiveNotification, object: nil)
        
        //radio change events
        notificationCenter.addObserver(self, selector: Selector("radioAccessChanged"), name: CTRadioAccessTechnologyDidChangeNotification, object: nil)
        
        
        do {
            reachability = try Reachability.reachabilityForInternetConnection()
        } catch {
            #if DEBUG
            print("Unable to create Reachability")
            #endif
        }

    }
    
    deinit {
        
        notificationCenter.removeObserver(self)
        
        audioSession.removeObserver(self, forKeyPath: "outputVolume")
        
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
                
                //start observe for updates
                startReachability()
                
                //start observe audio changes
                startAudoVolumeObserving()
                
                completionHandler(nil, js)
                
            }
        }
    }
    
    func onReady() throws -> JSValue {
        return JSValue([Env.pluginId:"ready"])
    }
    
    override func observeValueForKeyPath(keyPath: String?, ofObject object: AnyObject?, change: [String : AnyObject]?, context: UnsafeMutablePointer<Void>) {
        if keyPath == "outputVolume" {
            if let d = delegate, let c = change, let old = c["old"] as? CGFloat, let new = c["new"] as? CGFloat {
                if new > old {
                    d.vigourBridge.sendJSMessage(VigourBridgeSendMessage.Receive(error: nil, event: "button", message: JSValue("volUp"), pluginId: Env.pluginId))
                }
                else {
                    d.vigourBridge.sendJSMessage(VigourBridgeSendMessage.Receive(error: nil, event: "button", message: JSValue("volDown"), pluginId: Env.pluginId))
                }
            }
        }
    }
    
    //MARK:- Notifications
    
    func appwillEnterForeground() {
        if let d = delegate {
            d.vigourBridge.sendJSMessage(VigourBridgeSendMessage.Receive(error: nil, event: "enterForeground", message: JSValue(true), pluginId: Env.pluginId))
        }
        
        do {
            try audioSession.setActive(true)
        }
        catch {
            
        }
    }
    
    func appWillResignActive() {
        if let d = delegate {
            d.vigourBridge.sendJSMessage(VigourBridgeSendMessage.Receive(error: nil, event: "pause", message: JSValue(true), pluginId: Env.pluginId))
        }
    }
    
    func appDidBecomeActive() {
        if let d = delegate {
            d.vigourBridge.sendJSMessage(VigourBridgeSendMessage.Receive(error: nil, event: "resume", message: JSValue(true), pluginId: Env.pluginId))
        }
    }
    
    func radioAccessChanged() {
        if let d = delegate {
            let networkInfo = telNetworkInfo.currentRadioAccessTechnology ?? "none"
             d.vigourBridge.sendJSMessage(VigourBridgeSendMessage.Receive(error: nil, event: "radioAccessChange", message: JSValue(["networkInfo":networkInfo]), pluginId: Env.pluginId))
        }
    }
    
    //MARK: - Private
    
    private func startAudoVolumeObserving() {
        do {
            try audioSession.setActive(true)
            audioSession.addObserver(self, forKeyPath: "outputVolume", options: [NSKeyValueObservingOptions.New, NSKeyValueObservingOptions.Old], context: nil)
        }
        catch {
            
        }
    }
    
    private func startReachability() {
        
        if let r = reachability {
            
            //scan on bg thread, send message to js will be on main thread
            r.whenReachable = { [weak self] status in
                
                if let weakSelf = self, let d = weakSelf.delegate {
                    
                    var connectionType = "wifi"
                    if status.currentReachabilityStatus == .ReachableViaWWAN {
                        connectionType = weakSelf.telNetworkInfo.standardGrouping(weakSelf.telNetworkInfo.currentRadioAccessTechnology ?? "")
                    }
                    
                    d.vigourBridge.sendJSMessage(VigourBridgeSendMessage.Receive(error: nil, event: "change", message: JSValue(["network":connectionType]), pluginId: Env.pluginId))
                }
                
            }
            
            r.whenUnreachable = { [weak self] status in
                if let weakSelf = self, let d = weakSelf.delegate {
                    d.vigourBridge.sendJSMessage(VigourBridgeSendMessage.Receive(error: nil, event: "change", message: JSValue(["network":"none"]), pluginId: Env.pluginId))
                }
            }
            
            do {
                try r.startNotifier()
            } catch {
                print("Unable to start notifier")
            }
        }
    }
    
    private func getInfo() -> JSValue {
        var jsObject = [String:NSObject]()
        if let r = reachability {
            jsObject["network"] = r.currentReachabilityString
        }
        else {
            jsObject["network"] = "none"
        }
        jsObject["bundleId"] = NSBundle.mainBundle().bundleIdentifier
        jsObject["country"] =  NSLocale.currentLocale().objectForKey(NSLocaleCountryCode) as? String ?? ""
        jsObject["language"] = NSLocale.currentLocale().objectForKey(NSLocaleLanguageCode) as? String ?? ""
        jsObject["region"] = NSLocale.currentLocale().objectForKey(NSLocaleCountryCode) as? String ?? ""
        
        let now = NSDate()
        let f = NSDateFormatter()
        f.dateFormat = "Z"
        let timeZone = f.stringFromDate(now)
        f.dateFormat = "YYYY-MM-dd"
        let date = f.stringFromDate(now)
        f.dateFormat = "HH:mm:ss"
        let time = f.stringFromDate(now)
        jsObject["timezone"] = "\(date)T\(time)\(timeZone)"
//        jsObject["timezone"] = NSTimeZone.localTimeZone().localizedName(NSTimeZoneNameStyle.Generic, locale: NSLocale.currentLocale())
        jsObject["model"] = UIDevice.currentDevice().modelName
        jsObject["os"] = UIDevice.currentDevice().systemName
        jsObject["osVersion"] = UIDevice.currentDevice().systemVersion
        jsObject["appVersion"] = NSBundle.mainBundle().objectForInfoDictionaryKey("CFBundleShortVersionString") as? String ?? ""
        jsObject["build"] = NSBundle.mainBundle().infoDictionary!["CFBundleVersion"] as? String ?? ""

        return JSValue(jsObject)
    }
}
