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

struct Orientation: VigourPluginProtocol {
    
    static let sharedInstance = Orientation()
    
    static let pluginId = "orientation"
    
    weak var delegate: VigourBridgeViewController?
    
    func callMethodWithName(name: String, andArguments args:NSDictionary?, completionHandler:pluginResult) throws {
        guard let method = VigourOrientationMethod.init(rawValue: name)
        else {
            throw VigourBridgeError.PluginError("Unsupported method!", pluginId: Orientation.pluginId)
        }
        
        switch method {
        case .Init:
            completionHandler(nil, JSValue(mapOrientationValue(UIDevice.currentDevice().orientation)))
        case .Orientation:
            if let orientation = args?.objectForKey("orientation") as? String {
                print(orientation)
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
    
}