package io.vigour.nativewrapper.plugin.core;

/**
 * Created by michielvanliempt on 22/11/15.
 */
public interface ActivityResultListener {
    void onActivityResult(int requestCode, int resultCode, Object data);
}
