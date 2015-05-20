//
//  ViewController.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 06/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//



import WebKit
import UIKit

class MainViewController: UIViewController, WKUIDelegate {
    
    let vigourBridge = VigourBridge()
    
    //wrapper for web app
    var webView: WKWebView?
    
    lazy var userContentController: WKUserContentController = {
        let controller = WKUserContentController()
        controller.addScriptMessageHandler(self.vigourBridge, name: VigourBridge.scriptMessageHandlerName())
        return controller
    }()
    
    lazy var configuration: WKWebViewConfiguration = {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaPlaybackRequiresUserAction = true
        config.userContentController = self.userContentController
        return config
    }()
    
    lazy var appplicationIndexPath: String = {
        if let path = NSBundle.mainBundle().pathForResource("Info", ofType: "plist") {
            let dict = NSDictionary(contentsOfFile: path)
            if let path = dict?.objectForKey("appIndexPath") as? String {
                return path
            }
        }
        return "index.html"
    }()

    
    required init(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setup()
        loadApp()
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
    
    private func setup() {
        
        webView = WKWebView(frame: CGRectZero, configuration: configuration)
        webView?.UIDelegate = self
        webView?.scrollView.bounces = false
        view.addSubview(webView!)
        
        webView!.setTranslatesAutoresizingMaskIntoConstraints(false)
        let height = NSLayoutConstraint(item: webView!, attribute: .Height, relatedBy: .Equal, toItem: view, attribute: .Height, multiplier: 1, constant: 0)
        let width = NSLayoutConstraint(item: webView!, attribute: .Width, relatedBy: .Equal, toItem: view, attribute: .Width, multiplier: 1, constant: 0)
        view.addConstraints([height, width])
        
    }
    
    private func loadApp() {
        let path = "\(webAplicationFolderPath)/\(appplicationIndexPath)"
        println(path)
        let url = NSURL(fileURLWithPath: path)
        webView!.loadRequest(NSURLRequest(URL: url!))
    }
    
    
    //MARK: - WKUIDelegate
    
    func webView(webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: () -> Void) {
        print("\(message)")
        completionHandler()
    }
    
}