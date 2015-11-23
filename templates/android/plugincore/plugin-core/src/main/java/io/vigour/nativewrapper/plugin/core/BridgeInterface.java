package io.vigour.nativewrapper.plugin.core;

/**
 * Created by michielvanliempt on 09/04/15.
 */
public interface BridgeInterface extends BridgeEvents {
    void result(int callId, String error, String response);
    void ready(String error, String response, String pluginId);
}
