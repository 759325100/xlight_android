package com.xlight;

import android.app.Activity;
import android.app.Application;
import android.util.Log;

import com.cboy.rn.splashscreen.SplashScreen;
import com.facebook.react.ReactApplication;
import com.cboy.rn.splashscreen.SplashScreenReactPackage;

import cn.reactnative.modules.update.UpdatePackage;
import cn.reactnative.modules.update.UpdateContext;

import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.oblador.vectoricons.VectorIconsPackage;
import com.internal.InternalPackage;
import com.umeng.message.IUmengRegisterCallback;
import com.umeng.message.PushAgent;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new SplashScreenReactPackage(),
                    new UpdatePackage(),
                    new VectorIconsPackage(),
                    new InternalPackage()
            );
        }

        @Override
        protected String getJSBundleFile() {
            return UpdateContext.getBundleUrl(MainApplication.this);
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        final PushAgent mPushAgent = PushAgent.getInstance(this);
        //统计启动数据
        PushAgent.getInstance(getBaseContext()).onAppStart();
        //启动推送
        new Thread(new Runnable() {
            @Override
            public void run() {
                mPushAgent.register(new IUmengRegisterCallback() {

                    @Override
                    public void onSuccess(String deviceToken) {
                        //注册成功会返回device token
                        Log.i("XLight", "umeng register success,deviceId is " + deviceToken);
                    }

                    @Override
                    public void onFailure(String s, String s1) {
                        Log.i("XLight", "umeng register faild,deviceId is " + s + "," + s1);
                    }
                });
            }
        }).start();
        SoLoader.init(this, /* native exopackage */ false);
    }
}
