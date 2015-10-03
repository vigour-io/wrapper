//
//  vigour_nativeTests.swift
//  vigour-nativeTests
//
//  Created by Alexander van der Werff on 06/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//

import UIKit
import XCTest

class vigour_nativeTests: XCTestCase {
    
    override func setUp() {
        super.setUp()
        
    }
    
    override func tearDown() {
        super.tearDown()
    }
    
    func testVigourPluginRegistry() {
        VigourPluginManager.registerPlugin(Logger.pluginId, type: Logger.self)
        XCTAssertNotNil(VigourPluginManager.pluginTypeMap["vigour.logger"]!.instance(), "plugin not initialized")
    }
    
    func testPerformanceExample() {
        // This is an example of a performance test case.
        self.measureBlock() {
            // Put the code you want to measure the time of here.
        }
    }
    
}
