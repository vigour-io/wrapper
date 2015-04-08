package io.vigour.cloudandroidwrapper.plugin;

import java.util.Map;

/**
 * Created by michielvanliempt on 08/04/15.
 */
public class PluginManager {

    private Map<String, VigourPlugin> plugins;

    public void register(VigourPlugin plugin) {
        plugins.put(plugin.getName(), plugin);
    }

    public void execute(CallContext context) {
        VigourPlugin plugin = plugins.get(context.pluginId);

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
