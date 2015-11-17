package io.vigour.nativewrapper;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;

/**
 * Created by michielvanliempt on 05/11/15.
 */
public class SplashActivity extends Activity {

    Runnable removeSplash = new Runnable() {
        @Override
        public void run() {
            startActivity(new Intent(SplashActivity.this, MainActivity.class));
            finish();
        }
    };

    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        int delay = getResources().getInteger(R.integer.splashDuration);
        findViewById(R.id.splash).postDelayed(removeSplash, delay);

    }
}
