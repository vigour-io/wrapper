//
//  VigourPluginRegistration.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 06/09/15.
//  Copyright © 2015 Vigour.io. All rights reserved.
//

import Foundation

/**
    VigourPluginRegistration file will be overwritten by Vigour native build with all dependant plugin register calls
    (required because lack of introspection)
*/
extension VigourPluginManager {
    static func register() {
        VigourPluginManager.registerPlugin(Logger.self)
        VigourPluginManager.registerPlugin(Facebook.self)
        VigourPluginManager.registerPlugin(Env.self)
        VigourPluginManager.registerPlugin(StatusBar.self)
        VigourPluginManager.registerPlugin(Orientation.self)
        VigourPluginManager.registerPlugin(Purchase.self)
        VigourPluginManager.registerPlugin(Chromecast.self)
    }
}