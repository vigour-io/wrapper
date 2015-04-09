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
            throw new IllegalArgumentException(String.format("%s expects %d arguments, only 0 or 1 supported", method.getName(), parameterCount));
        }
    }

    @Override
    public String run(Object arguments) throws InvocationTargetException, IllegalAccessException {

        Object result = null;
        if (method.getParameterTypes().length == 0) {
            result = method.invoke(plugin);
        } else {
            result = method.invoke(plugin, arguments);
        }

        if (result == null) {
            return "ok";
        }
        return result.toString();
    }

    @Override
    public String getName() {
        return name;
    }
}
