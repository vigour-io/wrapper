//
//  MainController.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 06/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//


import AssetsLibrary
import Foundation
import UIKit



class MainController {
    
    var mainViewController: UIViewController {

        return contentViewNavController
    }
    
    private var contentViewNavController: VigourViewController!

    
    private lazy var mainStoryboard: UIStoryboard = {
        return UIStoryboard(name: "Main", bundle: nil)
    }()
    

    deinit {
        
    }
    
    init() {
        setup()
    }
    
    
    //MARK: - Setup
    
    func setup() {
        contentViewNavController = mainStoryboard.instantiateInitialViewController() as! VigourViewController
    }

    
}