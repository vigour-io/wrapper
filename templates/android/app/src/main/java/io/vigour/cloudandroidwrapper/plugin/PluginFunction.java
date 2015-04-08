package io.vigour.cloudandroidwrapper.plugin;

import java.lang.reflect.InvocationTargetException;

/**
 * Created by michielvanliempt on 08/04/15.
 */
public interface PluginFunction {

    /**
     * execute the function with the previously supplied arguments
     * @param arguments - can be anything that JSON.parse can make
     * @return an object that JSON.asString can stringify to send to the js
     * @throws java.lang.IllegalArgumentException if the arguments are not what's expected
     */
    String run(Object arguments) throws InvocationTargetException, IllegalAccessException;

    /**
     * the name of the function (as used by the plugin system)
     * @return
     */
    String getName();
}
