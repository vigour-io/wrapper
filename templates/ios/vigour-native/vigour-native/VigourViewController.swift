//
//  ViewController.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 06/04/15.
//  Copyright (c) 2015 Vigour.io. All rights reserved.
//



import WebKit
import UIKit

class VigourViewController: UIViewController, WKUIDelegate {
    
    let vigourBridge = VigourBridge(pluginManager: VigourPluginManager())
    
    var statusBarHidden = true {
        didSet {
            setNeedsStatusBarAppearanceUpdate()
        }
    }
    
    var statusBarStyle: UIStatusBarStyle = .Default {
        didSet {
            setNeedsStatusBarAppearanceUpdate()
        }
    }
    
    //wrapper for web app
    var webView: WKWebView?
    
    lazy var userContentController: WKUserContentController = { [unowned self] in
        let controller = WKUserContentController()
        controller.addScriptMessageHandler(self.vigourBridge, name: VigourBridge.scriptMessageHandlerName())
        self.vigourBridge.delegate = self
        return controller
    }()
    
    lazy var configuration: WKWebViewConfiguration = {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaPlaybackRequiresUserAction = false
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
    
    
    required init?(coder aDecoder: NSCoder) {
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
        
        webView!.translatesAutoresizingMaskIntoConstraints = false
        let height = NSLayoutConstraint(item: webView!, attribute: .Height, relatedBy: .Equal, toItem: view, attribute: .Height, multiplier: 1, constant: 0)
        let width = NSLayoutConstraint(item: webView!, attribute: .Width, relatedBy: .Equal, toItem: view, attribute: .Width, multiplier: 1, constant: 0)
        view.addConstraints([height, width])
        
    }
    
    private func loadApp() {
        let path = "\(webAplicationFolderPath)/\(appplicationIndexPath)"
        print(path)
        let url = NSURL(fileURLWithPath: path)
        webView!.loadRequest(NSURLRequest(URL: url))
    }
    
    override func prefersStatusBarHidden() -> Bool {
        return statusBarHidden
    }
    
    override func preferredStatusBarUpdateAnimation() -> UIStatusBarAnimation {
        return UIStatusBarAnimation.Slide
    }
    
    override func preferredStatusBarStyle() -> UIStatusBarStyle {
        return statusBarStyle
    }
    
    //MARK: - WKUIDelegate
    
    func webView(webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: () -> Void) {
        let alertController = UIAlertController(title: webView.URL?.host, message: message, preferredStyle: UIAlertControllerStyle.Alert)
        alertController.addAction(UIAlertAction(title: "Close", style: UIAlertActionStyle.Cancel, handler: { (action) -> Void in
            completionHandler()
        }))
        presentViewController(alertController, animated: true, completion: nil)
    }
    
}