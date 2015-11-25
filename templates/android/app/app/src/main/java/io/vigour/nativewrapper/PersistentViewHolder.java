package io.vigour.nativewrapper;

import android.view.View;

import org.xwalk.core.XWalkView;

/**
 * Created by michielvanliempt on 05/11/15.
 */
public class PersistentViewHolder {

    private static View webView;

    public static View get() {
        return webView;
    }

    public static void set(View webView) {
        PersistentViewHolder.webView = webView;
    }
}
