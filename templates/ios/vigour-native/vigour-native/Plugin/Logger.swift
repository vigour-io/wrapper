//
//  Logger.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 09/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//

import Foundation

struct Logger: VigourPluginProtocol {
    
    //MARK: - VigourPluginProtocol
    
    static let pluginId = "vigour.logger"

    weak var delegate: VigourBridgeViewController?
    
    func callMethodWithName(name: String, andArguments args:NSDictionary?, completionHandler:PluginResult) throws {
        switch(name) {
        case "log":
            if let message = args?.objectForKey("message") {
                log(message)
            }
        default:break
        }
        
        completionHandler(nil, JSValue(["succes":true]))
    }
    
    func onReady() throws -> JSValue {
        return JSValue([Logger.pluginId:"ready"])
    }
    
    static func instance() -> VigourPluginProtocol {
        return Logger()
    }
    
    //MARK: - Plugin implementation
    
    func log(message: AnyObject) {
        print("<Vigour Log> \(message)")
    }
    
}