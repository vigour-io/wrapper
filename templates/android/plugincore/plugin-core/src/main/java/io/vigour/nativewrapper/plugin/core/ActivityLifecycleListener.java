package io.vigour.nativewrapper.plugin.core;

/**
 * Created by michielvanliempt on 29/11/15.
 */
public interface ActivityLifecycleListener {
    void onPause();

    void onStop();

    void onResume();

    void onStart();
}
