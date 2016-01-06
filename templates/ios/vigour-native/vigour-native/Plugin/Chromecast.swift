//
//  Chromecast.swift
//  vigour-native
//
//  Created by Alexander van der Werff on 09/04/15.
//  Copyright (c) 2016 Vigour.io. All rights reserved.
//

import Foundation


enum ChromecastMethod: String {
    case Init="init", StartCasting="startCasting", StopCasting="stopCasting"
}

class Chromecast:NSObject, VigourPluginProtocol, GCKDeviceScannerListener, GCKDeviceManagerDelegate {
    
    private var deviceScanner:GCKDeviceScanner?
    
    
    //MARK: - VigourPluginProtocol
    
    static let sharedInstance = Chromecast()
    
    static let pluginId = "chromecast"
    
    weak var delegate: VigourBridgeViewController?
    
    func callMethodWithName(name: String, andArguments args: NSDictionary?, completionHandler: PluginResult) throws {
        guard let method = ChromecastMethod.init(rawValue: name)
            else {
                throw VigourBridgeError.PluginError("Unsupported method!", pluginId: Chromecast.pluginId)
        }
        switch(method) {
        case .Init:
            if let appId = args!["appId"] as? String where appId=="default" {
                startScanning(kGCKMediaDefaultReceiverApplicationID)
                completionHandler(nil, JSValue(true))
            }
            else if let appId = args!["appId"] as? String {
                startScanning(appId)
                completionHandler(nil, JSValue(true))
            }
            else {
                completionHandler(JSError(title:"Chromecast error", description: "An app id is required", todo:"provide the default value or an existing id"), JSValue(false))
            }
        case .StartCasting:
            print(args)
        case .StopCasting:
            print(args)
        }

    }
    
    func onReady() throws -> JSValue {
        return JSValue([Chromecast.pluginId:"ready"])
    }
    
    static func instance() -> VigourPluginProtocol {
        return Chromecast.sharedInstance
    }
    
    //MARK: - Plugin methods
    
    private func startScanning(identifier: String) {

        let filterCriteria = GCKFilterCriteria(forAvailableApplicationWithID: identifier)
        
        /// Initialize device scanner
        deviceScanner = GCKDeviceScanner(filterCriteria: filterCriteria)
        if let deviceScanner = deviceScanner {
            deviceScanner.addListener(self)
            deviceScanner.startScan()
            deviceScanner.passiveScan = true
        }
    }
    
    private func deviceListChanged(device: GCKDevice, online: Bool) {
        let event = online ? "deviceJoined" : "deviceLeft"
        if let d = delegate {
            d.vigourBridge.sendJSMessage(
                VigourBridgeSendMessage.Receive(
                    error: nil,
                    event: event,
                    message: JSValue(
                        [
                            "id":device.deviceID,
                            "name":device.friendlyName,
                            "modelName":device.modelName,
                            "manufacturer":device.manufacturer
                        ]
                    ),
                    pluginId: Chromecast.pluginId
                )
            )
        }
    }
    
    // MARK: GCKDeviceScannerListener
    
    func deviceDidComeOnline(device: GCKDevice!) {
        #if DEBUG
        print("Device found: \(device.friendlyName)")
        #endif
        deviceListChanged(device, online: true)
    }
    
    func deviceDidGoOffline(device: GCKDevice!) {
        #if DEBUG
        print("Device went away: \(device.friendlyName)")
        #endif
        deviceListChanged(device, online: false)
    }
    
}