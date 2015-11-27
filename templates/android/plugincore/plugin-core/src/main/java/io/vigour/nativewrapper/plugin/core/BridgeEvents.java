package io.vigour.nativewrapper.plugin.core;

/**
 * Created by michielvanliempt on 23/11/15.
 */
public interface BridgeEvents {
    void error(String error, String pluginId);
    void receive(String error, String message, String pluginId);
}
