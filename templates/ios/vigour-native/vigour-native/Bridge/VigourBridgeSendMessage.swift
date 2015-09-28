//
//  VigourBridgeJSMessage.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 28/09/15.
//  Copyright © 2015 Vigour.io. All rights reserved.
//

import Foundation

enum VigourBridgeSendMessage {
    case Error(error: ErrorType, pluginId: String)
    case Receive(error: ErrorType, message: Dictionary<String, AnyObject>, pluginId: String)
    case Result(calbackId: Int, error: ErrorType, response: Dictionary<String, AnyObject>)
    case Ready(error: ErrorType, response: Dictionary<String, AnyObject>, pluginId: String)
    
    var jsObject: String {
        get {
            switch self {
                
            }
        }
    }
}
