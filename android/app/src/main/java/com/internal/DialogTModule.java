package com.internal;

import android.util.Log;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import android.widget.Toast;


/**
 * Created by 75932 on 2017/4/17.
 */
public class DialogTModule extends ReactContextBaseJavaModule {
    public DialogTModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "DialogAndroid";
    }

    @ReactMethod
    public void show(String text) {
        try {
            Toast.makeText(getReactApplicationContext(), text, Toast.LENGTH_SHORT).show();
            Log.i("XLight", text);
        } catch (Exception e) {
            Log.e("XLight", e.getMessage());
        }
    }
}
