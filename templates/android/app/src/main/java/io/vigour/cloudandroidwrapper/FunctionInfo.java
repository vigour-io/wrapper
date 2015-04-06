package io.vigour.cloudandroidwrapper;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

/**
* Created by michielvanliempt on 25/03/15.
*/
class FunctionInfo {
    String name;
    List<String> parameterTypes = new ArrayList<>();
    String returnType;

    public FunctionInfo() {
    }

    public FunctionInfo(Method m) {
        name = m.getName();
        for (Class<?> type : m.getParameterTypes()) {
            addParameterType(type.getSimpleName());
        }
        returnType = m.getReturnType().getSimpleName();
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getParameterTypes() {
        return parameterTypes;
    }

    public void setParameterTypes(List<String> parameterTypes) {
        this.parameterTypes = parameterTypes;
    }

    public void addParameterType(String type) {
        parameterTypes.add(type);
    }

    public String getReturnType() {
        return returnType;
    }

    public void setReturnType(String returnType) {
        this.returnType = returnType;
    }
}
