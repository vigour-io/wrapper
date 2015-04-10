//
//  DummyPlugin.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 09/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//

import Foundation

class TestPlugin: VigourPlugin {
    
    func log(message: String) {
        println(message)
    }
    
}