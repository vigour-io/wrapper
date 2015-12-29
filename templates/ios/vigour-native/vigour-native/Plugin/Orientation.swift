//
//  Orientation.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 21/12/15.
//  Copyright © 2015 RxSwift. All rights reserved.
//

import Foundation
import UIKit

enum VigourOrientationMethod: String {
    case Init="init", Orientation="orientation", Locked="locked"
}

class Orientation:NSObject, VigourPluginProtocol {
    
    override init() {
        super.init()
        
        NSNotificationCenter.defaultCenter().addObserver(self, selector: Selector("orientationChanged:"), name: UIDeviceOrientationDidChangeNotification, object: nil)
    }
    
    deinit {
        NSNotificationCenter.defaultCenter().removeObserver(self)
    }
    
    
    static let sharedInstance = Orientation()
    
    static let pluginId = "orientation"
    
    weak var delegate: VigourBridgeViewController?
    
    func callMethodWithName(name: String, andArguments args:NSDictionary?, completionHandler:PluginResult) throws {
        guard let method = VigourOrientationMethod.init(rawValue: name)
        else {
            throw VigourBridgeError.PluginError("Unsupported method!", pluginId: Orientation.pluginId)
        }
        
        switch method {
        case .Init:

            completionHandler(nil, JSValue(mapOrientationValue(UIDevice.currentDevice().orientation)))
        case .Orientation:
            if let orientation = args?.objectForKey("orientation") as? String where orientation == "portrait" {
                UIDevice.currentDevice().setValue(UIInterfaceOrientation.Portrait.rawValue, forKey: "orientation")
            }
            else if let orientation = args?.objectForKey("orientation") as? String where orientation == "landscape" {
                UIDevice.currentDevice().setValue(UIInterfaceOrientation.LandscapeLeft.rawValue, forKey: "orientation")
            }
        case .Locked:
            if let locked = args?.objectForKey("locked") as? Bool, let d = delegate {
                d.autoRotate = !locked
            }
        default:break
        }
        
    }
    
    static func instance() -> VigourPluginProtocol {
        return Orientation.sharedInstance
    }
    
    func onReady() throws -> JSValue {
        return JSValue([Orientation.pluginId:"ready"])
    }
 
    ///private
    func mapOrientationValue(o:UIDeviceOrientation) -> String {
        if UIDeviceOrientationIsLandscape(o) {
            return "landscape"
        }
        else if UIDeviceOrientationIsPortrait(o) {
            return "portrait"
        }
        else {
            return "unknown"
        }
    }
    
    //MARK:- orientationChanged
    
    func orientationChanged(notification:NSNotification) {
        if let d = delegate {
            let orientation = mapOrientationValue(UIDevice.currentDevice().orientation)
            d.vigourBridge.sendJSMessage(VigourBridgeSendMessage.Receive(error: nil, event: "change", message: JSValue(orientation), pluginId: Orientation.pluginId))
        }
    }
    
}