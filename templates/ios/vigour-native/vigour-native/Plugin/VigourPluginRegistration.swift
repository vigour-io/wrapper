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
        VigourPluginManager.registerPlugin(Logger.pluginId, type: Logger.self)
        VigourPluginManager.registerPlugin(Facebook.pluginId, type: Facebook.self)
        VigourPluginManager.registerPlugin(Env.pluginId, type: Env.self)
        VigourPluginManager.registerPlugin(StatusBar.pluginId, type: StatusBar.self)
    }
}