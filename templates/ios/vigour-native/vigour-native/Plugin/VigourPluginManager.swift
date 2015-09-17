//
//  VigourPluginManager.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 09/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//

import Foundation


struct VigourPluginManager {
    
    var plugins:Dictionary<String, VigourPluginProtocol> = [:]
    
    static var pluginTypeMap:[String:Any] = [:]
    
    init() {
        setup()
    }

    private func setup() {
        VigourPluginManager.register()
    }
    
    static func registerPlugin(id: String, type: Any) {
        VigourPluginManager.pluginTypeMap[id] = type
    }
    
}
