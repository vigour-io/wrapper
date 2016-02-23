//
//  VigourPluginManager.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 09/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//

import Foundation


struct VigourPluginManager {

    static var pluginTypeMap:[String:VigourPluginProtocol.Type] = [:]
    
    static func registerPlugin<T:VigourPluginProtocol>(type: T.Type) {
        
        VigourPluginManager.pluginTypeMap[T.pluginId] = type
        #if DEBUG
            print("*****PLUGIN \(T.pluginId) REGISTERED*****")
        #endif
    }
    
}
