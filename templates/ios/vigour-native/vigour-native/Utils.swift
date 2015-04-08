//
//  Utils.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 08/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//

import Foundation

func copyFolderToFolder(source: String, destination: String) {
    
    let filemgr = NSFileManager.defaultManager()

    //NOTE: - check if folder
    
    var error: NSError?
    
    if filemgr.fileExistsAtPath(destination) {
        filemgr.removeItemAtPath(destination, error: &error)
        if let e = error {
            println("\(e.localizedDescription)")
            return
        }
    }
    
    filemgr.copyItemAtPath(source, toPath: destination, error: &error)
    if let e = error {
        println("\(e.localizedDescription)")
    }
    
}