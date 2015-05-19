//
//  VigourBridgeMessage.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 10/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//

import Foundation

enum MessageRestult {
    case Success, Failure
}

struct Message {
    let calbackId: Int
    let pluginName: String
    let pluginMethod: String
    let arguments: [String]
}