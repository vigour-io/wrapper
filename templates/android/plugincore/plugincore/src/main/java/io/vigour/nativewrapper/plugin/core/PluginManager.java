package io.vigour.nativewrapper.plugin.core;

import java.util.Map;
import java.util.TreeMap;

/**
 * Created by michielvanliempt on 08/04/15.
 */
public class PluginManager {

    private Map<String, Plugin> plugins = new TreeMap<>();

    public void register(Plugin plugin) {
        plugins.put(plugin.getName(), plugin);
    }

    public void execute(CallContext context) {
        Plugin plugin = plugins.get(context.pluginId);

        if (plugin == null) {
            context.error(String.format("plugin %s not registered on native side", context.pluginId));
        }

        PluginFunction function = plugin.getFunction(context.functionName);
        if (function == null) {
            context.error(String.format("function %s not found in plugin %s", context.functionName, context.pluginId));
        }

        context.execute(function);
    }
}
