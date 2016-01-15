package io.vigour.nativewrapper.plugin.core;

/**
 * Created by michielvanliempt on 23/11/15.
 */
public interface BridgeEvents {
    void receive(String event, Object data, String pluginId);
}
