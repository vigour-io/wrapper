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
    
    func callMethodWithName(name: String, andArguments args:NSDictionary?, completionHandler:pluginResult) {
        switch(name) {
        case "log":log("test")
        default:return
        }
        
        completionHandler(nil, NSDictionary())
    }
    
    static func instance() -> VigourPluginProtocol {
        return Logger()
    }
    
    //MARK: - Plugin implementation
    
    func log(message: String) {
        print(message)
    }
    
}