package com.umarbhutta.xlightcompanion.SDK.Cloud;

import android.content.Context;
import android.util.Log;

import com.umarbhutta.xlightcompanion.SDK.CloudAccount;

import java.util.ArrayList;
import java.util.List;

import io.particle.android.sdk.cloud.ParticleCloudException;
import io.particle.android.sdk.cloud.ParticleCloudSDK;
import io.particle.android.sdk.cloud.ParticleDevice;

/**
 * Created by Umar Bhutta.
 */
@SuppressWarnings({"UnusedDeclaration"})
public class ParticleAdapter {
    // misc
    private static final String TAG = ParticleAdapter.class.getSimpleName();

    private static boolean m_bInitialized = false;
    private static int resultCode;
    private static boolean m_bLoggedIn = false;
    private static List<ParticleDevice> m_devices;
    private static ArrayList<String> m_deviceID2Name = new ArrayList<>();

    // Particle functions
    public static void init(Context context) {
        ParticleCloudSDK.init(context);
        m_bInitialized = true;
    }

    public static boolean initialized() {
        return m_bInitialized;
    }

    public static boolean isAuthenticated() {
        //return (ParticleCloudSDK.getCloud().isLoggedIn());
        return m_bLoggedIn;
    }

    //Waroom Modify at 2017-04-24 -> add username and password params
    public static void authenticate(String username, String password) {
        final String user = username;
        final String pass = password;
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Log.i("XLight", String.format("Username:%s Password:%s", user, pass));
                    ParticleCloudSDK.getCloud().logIn(user, pass);
                    queryDevices();
                    m_bLoggedIn = true;
                } catch (ParticleCloudException e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }

    // Synchronous query
    private static int queryDevices() {
        // Make the Particle call here
        try {
            String sItem;
            m_devices = ParticleCloudSDK.getCloud().getDevices();
            m_deviceID2Name.clear();
            for (ParticleDevice device : m_devices) {
                sItem = device.getID() + ":" + device.getName();
                m_deviceID2Name.add(sItem);
            }
        } catch (ParticleCloudException e) {
            e.printStackTrace();
            resultCode = -1;
        }
        return resultCode;
    }

    // Asynchronous operation
    public static int getDeviceList() {
        resultCode = 0;
        new Thread() {
            @Override
            public void run() {
                queryDevices();
            }
        }.start();
        return resultCode;
    }

    public static int getDeviceCount() {
        return m_devices.size();
    }

    // ID:Name
    public static ArrayList<String> getDeviceNames() {
        return m_deviceID2Name;
    }

    public static boolean checkDeviceID(final String devID) {
        if (isAuthenticated()) {
            for (ParticleDevice device : m_devices) {
                if (devID.equalsIgnoreCase(device.getID())) {
                    return true;
                }

            }
        }
        return false;
    }
}