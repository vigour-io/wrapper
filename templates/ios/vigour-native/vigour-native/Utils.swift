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
        do {
            try filemgr.removeItemAtPath(destination)
        } catch let error1 as NSError {
            error = error1
        }
        if let e = error {
            print("\(e.localizedDescription)")
            return
        }
    }
    
    do {
        try filemgr.copyItemAtPath(source, toPath: destination)
    } catch let error1 as NSError {
        error = error1
    }
    if let e = error {
        print("\(e.localizedDescription)")
    }
    
    print(destination)
    
}