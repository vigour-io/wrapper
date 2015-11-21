//
//  VigourBridgeMessage.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 10/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//

import Foundation


struct VigourBridgeReceiveMessage {
    let callbackId: Int?
    let pluginId: String
    let pluginMethod: String
    let arguments: NSDictionary?
}
