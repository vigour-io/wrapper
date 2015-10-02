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

    weak var delegate: VigourViewController?
    
    func callMethodWithName(name: String, andArguments args:NSDictionary?, completionHandler:pluginResult) throws {
        switch(name) {
        case "log":
            if let message = args?.objectForKey("message") as? String {
                log(message)
            }
        default:break
        }
        
        completionHandler(nil, JSObject(["succes":true]))
    }
    
    static func instance() -> VigourPluginProtocol {
        return Logger()
    }
    
    //MARK: - Plugin implementation
    
    func log(message: String) {
        print("<Vigour Log> \(message)\n")
    }
    
}