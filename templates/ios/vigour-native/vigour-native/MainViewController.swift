//
//  ViewController.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 06/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//

// WKWebView has an issue not able load html files from local disk
// http://openradar.appspot.com/20160687
// https://issues.apache.org/jira/browse/CB-7539

// two options to bypass the issue:
//  - user a server like: https://github.com/robbiehanson/CocoaHTTPServer
//    or https://developer.apple.com/legacy/library/samplecode/CocoaHTTPServer/Listings/CocoaHTTPServer_m.html
// - workaround is to copy www folder to tmp folder in de apps sandbox


import WebKit
import UIKit

class MainViewController: UIViewController, WKScriptMessageHandler {
    
    //wrapper for web app
    var webView: WKWebView?
    
    
    lazy var configuration: WKWebViewConfiguration = {
        let config = WKWebViewConfiguration()
        
        return config
        }()
    
    lazy var tmpFolder: String = {
        return NSTemporaryDirectory()
        }()
    
    
    required init(coder aDecoder: NSCoder) {
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
        
        //wkwebview fix
        //copyBundleWWWFolderToFolder()
        
        webView = WKWebView(frame: CGRectZero, configuration: configuration)
        
        loadApp()
        
        view.addSubview(webView!)
        webView!.setTranslatesAutoresizingMaskIntoConstraints(false)
        let height = NSLayoutConstraint(item: webView!, attribute: .Height, relatedBy: .Equal, toItem: view, attribute: .Height, multiplier: 1, constant: 0)
        let width = NSLayoutConstraint(item: webView!, attribute: .Width, relatedBy: .Equal, toItem: view, attribute: .Width, multiplier: 1, constant: 0)
        view.addConstraints([height, width])
        
    }
    
    private func loadApp() {
        let path = "\(tmpFolder)www/index.html"
        let url = NSURL(fileURLWithPath: path)
        println(path)
        webView!.loadRequest(NSURLRequest(URL: url!))
    }
    
    
    //MARK: - WKScriptMessageHandler
    
    func userContentController(userContentController: WKUserContentController, didReceiveScriptMessage message: WKScriptMessage) {
        if(message.name == "callbackHandler") {
            println("JavaScript is sending a message \(message.body)")
        }
    }
    
}