package io.vigour.nativewrapper.plugin.core;

/**
 * Created by michielvanliempt on 09/04/15.
 */
public interface BridgeInterface {
    void result(int callId, String error, String response);
    void error(String error, String pluginId);
    void ready(String error, String response, String pluginId);
    void receive(String error, String message, String pluginId);
}
