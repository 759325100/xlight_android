package com.xlight;

import android.content.pm.PackageManager;

import com.cboy.rn.splashscreen.SplashScreen;
import com.cboy.rn.splashscreen.SplashScreenReactPackage;

import android.os.Bundle;
import android.os.PersistableBundle;

import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "xlight";
    }

//    @Override
//    public void onCreate(Bundle savedInstanceState, PersistableBundle persistentState) {
//        SplashScreen.show(this);
//        super.onCreate(savedInstanceState, persistentState);
//    }
}
