//
//  VigourPlugin.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 09/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//

import Foundation

//for runtime inspection we need to extend from NSObject to allow introspection on its sub classes, e.g. plugins

class VigourPlugin : NSObject {
    
    // plugin name
    let id: String
    
    required init(id: String) {
        self.id = id
        super.init()
    }
    
}