package com.internal;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.net.wifi.ScanResult;
import android.net.wifi.WifiConfiguration;
import android.support.annotation.NonNull;
import android.support.v4.content.ContextCompat;
import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.google.gson.JsonArray;

import android.net.wifi.WifiManager;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.List;
import java.util.jar.Manifest;

/**
 * Created by 75932 on 2017/4/20.
 */
public class WifiCommand extends ReactContextBaseJavaModule {
    private WifiAdmin wifiAdmin = new WifiAdmin(getReactApplicationContext());
    private List<ScanResult> wifiScanList;
    private String TAG = "WifiCommmand";

    public WifiCommand(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "WifiCommand";
    }

    @ReactMethod
    public void connectWifi(int index, String password, Callback successCallback) {
        //监听消息
        Log.i("XLight", "get network config");
        ScanResult sr = wifiScanList.get(index);
        //判断是否配置过
        int result = wifiAdmin.IsConfiguration("\""
                + sr.SSID + "\"");
        if (result != -1) {
            //直接连接
            wifiAdmin.ConnectWifi(result);
            Log.i("XLight", "connecting ...");
        } else {
            //添加配置信息
            Log.i("XLight", "add network...");
            //判断该SSID是否为公开
            if (!password.equals("") || (sr.capabilities.indexOf("WPA") == -1 && sr.capabilities.indexOf("WEP") == -1)) {
                int netId = wifiAdmin
                        .AddWifiConfig(wifiScanList,
                                wifiScanList.get(index).SSID,
                                password);
                Log.i("XLight", "networkid:" + netId);
                if (netId != -1) {
                    //重新得到配置信息
                    wifiAdmin.getConfiguration();
                    if (wifiAdmin.ConnectWifi(netId)) {
                        Log.i("XLight", "connected success");
                        successCallback.invoke(0); //连接成功
                    }
                } else {
                    Log.i("XLight", "connected error");
                    successCallback.invoke(-1);//连接失败
                }
            } else {
                //输入密码
                Log.i("XLight", "please input password");
                successCallback.invoke(1);
            }
        }
    }

    Callback scanSuccessCallback;
    Callback scanErrorCallback;

    @ReactMethod
    public void getWifiList(Callback successCallback, Callback errorCallback) {
        try {
            Log.i(TAG, "open wifi");
            wifiAdmin.openWifi();
            Log.i(TAG, "start scan wifi");
            wifiAdmin.startScan(mReceiver);
            scanSuccessCallback = successCallback;
            scanErrorCallback = errorCallback;
        } catch (Exception e) {
            Log.e(TAG, e.getMessage());
        }
    }

    public BroadcastReceiver mReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            final String action = intent.getAction();
            // 该扫描已成功完成。
            if (action.equals(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION)) {
                Log.i(TAG, "get scan wifi result");
                //获取结果
                wifiScanList = wifiAdmin.getWifiList();

                Log.i(TAG, wifiAdmin.lookUpScan().toString());
                JSONArray jsonarray = new JSONArray();
                //处理结果
                for (ScanResult scanResult : wifiScanList) {
                    try {
                        // 把每个数据当作一对象添加到数组里
                        Log.i(TAG, "SSID:" + scanResult.SSID + " frequency:" + scanResult.frequency);
                        if (scanResult.SSID == "" || (scanResult.frequency > 4900 && scanResult.frequency < 5900))
                            continue;
                        JSONObject jsonObject = new JSONObject();
                        jsonObject.put("BSSID", scanResult.BSSID);
                        jsonObject.put("SSID", scanResult.SSID);
                        jsonObject.put("level", scanResult.level);
                        jsonObject.put("capabilities", scanResult.capabilities);
                        jsonObject.put("frequency", scanResult.frequency);
                        jsonarray.put(jsonObject);//向json数组里面添加pet对象
                    } catch (Exception ex) {
                        Log.i(TAG, "error invoke");
                        if (scanErrorCallback != null)
                            scanErrorCallback.invoke(ex.getMessage());
                        break;
                    }
                }
                if (scanSuccessCallback != null) {
                    Log.i(TAG, "success invoke");
                    scanSuccessCallback.invoke(jsonarray.toString());
                    scanSuccessCallback = null;
                    scanErrorCallback = null;
                    context.unregisterReceiver(mReceiver);
                }
            }
        }
    };
}
