package io.vigour.nativewrapper.plugin.core;

import java.lang.reflect.InvocationTargetException;

import rx.Observable;

/**
 * Created by michielvanliempt on 08/04/15.
 */
public interface PluginFunction {

    /**
     * execute the function with the previously supplied arguments
     * @param arguments - can be anything that JSON.parse can make
     * @return an object that JSON.asString can stringify to send to the js <b>or</b> an Observable that will yield a such an object
     * @throws java.lang.reflect.InvocationTargetException if function call can't be made through reflection
     * @throws java.lang.IllegalAccessException if function call can't be made through reflection
     */
    Object run(Object arguments) throws InvocationTargetException, IllegalAccessException;

    /**
     * @return the name of the function (as used by the plugin system)
     */
    String getName();
}
