//
//  ViewController.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 06/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//

import WebKit
import UIKit

class MainViewController: UIViewController, WKScriptMessageHandler {
    
    //wrapper for web app
    var webView: WKWebView
    
    required init(coder aDecoder: NSCoder) {
        webView = WKWebView()
        super.init(coder: aDecoder)
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setup()
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
    
    private func setup() {
        view.addSubview(webView)
        webView.setTranslatesAutoresizingMaskIntoConstraints(false)
        let height = NSLayoutConstraint(item: webView, attribute: .Height, relatedBy: .Equal, toItem: view, attribute: .Height, multiplier: 1, constant: 0)
        let width = NSLayoutConstraint(item: webView, attribute: .Width, relatedBy: .Equal, toItem: view, attribute: .Width, multiplier: 1, constant: 0)
        view.addConstraints([height, width])
        
        configureWebView()
        
        loadApp()
        
    }
    
    private func configureWebView() {
        
    }
    
    private func loadApp() {
        let path = NSBundle.mainBundle().pathForResource("www/index",
            ofType: "html")
        let url = NSURL(fileURLWithPath: path!)
        webView.loadRequest(NSURLRequest(URL: url!))
    }
    
    //MARK: - WKScriptMessageHandler
    
    func userContentController(userContentController: WKUserContentController, didReceiveScriptMessage message: WKScriptMessage) {
        if(message.name == "callbackHandler") {
            println("JavaScript is sending a message \(message.body)")
        }
    }
    
}