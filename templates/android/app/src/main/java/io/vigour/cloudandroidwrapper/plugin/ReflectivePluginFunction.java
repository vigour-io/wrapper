package io.vigour.cloudandroidwrapper.plugin;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * Created by michielvanliempt on 08/04/15.
 */
public class ReflectivePluginFunction implements PluginFunction {

    String name;
    Method method;
    VigourPlugin plugin;

    public ReflectivePluginFunction(String name, Method method, VigourPlugin plugin) {
        this.name = name;
        this.method = method;
        this.plugin = plugin;
        int parameterCount = method.getParameterTypes().length;
        if (parameterCount > 1) {
            throw new IllegalArgumentException(String.format("%s exects %d arguments, only 0 or 1 supported", method.getName(), parameterCount));
        }
    }

    @Override
    public String run(Object arguments) throws InvocationTargetException, IllegalAccessException {
        int parameterCount = method.getParameterTypes().length;
        if (parameterCount == 0) {
            return method.invoke(plugin).toString();
        }
        return method.invoke(plugin, arguments).toString();
    }

    @Override
    public String getName() {
        return name;
    }
}
