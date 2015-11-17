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
    
    init() {
        setup()
    }
    
    private func setup() {
        VigourPluginManager.register()
    }
    
    static func registerPlugin<T:VigourPluginProtocol>(id: String, type: T.Type) {
        VigourPluginManager.pluginTypeMap[id] = type
    }
    
}
