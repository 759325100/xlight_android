package com.internal;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.provider.ContactsContract;
import android.support.annotation.Nullable;
import android.telecom.Call;
import android.util.Log;

import com.facebook.imagepipeline.producers.Consumer;
import com.facebook.infer.annotation.Strict;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.umarbhutta.xlightcompanion.SDK.xltDevice;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Dictionary;
import java.util.HashMap;
import java.util.List;

/**
 * Created by 75932 on 2017/4/17.
 * 设备控制类
 */
public class Controller extends ReactContextBaseJavaModule {
    private List<xltDevice> lstXltDevice = new ArrayList<xltDevice>();
    private HashMap<String, List<Integer>> mapDevices = new HashMap<String, List<Integer>>();
    private final String TAG = "Controller";
    private String username;
    private String password;

    //构造函数
    public Controller(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "Controller";
    }

    private xltDevice xd = null;

    /**
     * 初始化连接
     */
    @ReactMethod
    public void Init(String username, String password) {
        try {
            Log.i(TAG, "Init xltDevice");
            xltDevice xd = new xltDevice();
            xd.Init(getReactApplicationContext(), username, password);
            xd.setEnableEventBroadcast(false);
            this.username = username;
            this.password = password;
        } catch (Exception e) {
            Log.e(TAG, e.getMessage());
        }
    }

    @ReactMethod
    public void InitList(String devices) {
        try {
            //释放lstXltDevice
            for (xltDevice xlt : lstXltDevice) {
                xlt.clearDataEventHandlerList();
                xlt.Disconnect();
            }
            lstXltDevice.clear();
            mapDevices.clear();
            JSONArray dataJson = new JSONArray(devices);
            for (int i = 0; i < dataJson.length(); i++) {
                JSONObject objJson = dataJson.getJSONObject(i);
                if (mapDevices.containsKey(objJson.getString("coreId"))) {
                    List<Integer> lst = mapDevices.get(objJson.getString("coreId"));
                    lst.add(objJson.getInt("nodeNo"));
                    mapDevices.put(objJson.getString("coreId"), lst);
                } else {
                    List<Integer> lst = new ArrayList<Integer>();
                    lst.add(objJson.getInt("nodeNo"));
                    mapDevices.put(objJson.getString("coreId"), lst);
                }
                this.CreateDevice(objJson);
            }
            Log.i(TAG, "lstXltDevice size:" + lstXltDevice.size());
        } catch (Exception e) {
            Log.i(TAG, "JSONArray Convert Error");
        }
    }

    private void CreateDevice(final JSONObject device) {
        try {
            //1、实例化对象
            xltDevice xd = this.getXltDevice(device.getString("coreId"));
            if (xd == null) {
                xd = new xltDevice();
                xd.Init(this.getReactApplicationContext(), this.username, this.password);
                //xd.setAutoBridge(false);
                //xd.useBridge(xltDevice.BridgeType.Cloud);
                //2、连接设备
                xd.Connect(device.getString("coreId"), new xltDevice.callbackConnect() {
                    @Override
                    public void onConnected(xltDevice.BridgeType bridge, boolean connected) {
                        try {
                            if (connected)
                                for (String key : mapDevices.keySet()) {
                                    if (key.equals(device.getString("coreId"))) {
                                        xltDevice xd = getXltDevice(device.getString("coreId"));
                                        //查询所有状态
                                        for (Integer n : mapDevices.get(key)) {
                                            xd.addNodeToDeviceList(n, device.getInt("deviceType"), device.getString("deviceName"));
                                            xd.QueryStatus(n);
                                            Log.i(TAG, "coreId:" + device.getString("coreId") + ",nd:" + n);
                                        }
                                        break;
                                    }
                                }
                        } catch (Exception ex) {
                            Log.e(TAG, ex.getMessage());
                        }
                    }
                });
                //3、设置属性
                xd.setEnableEventBroadcast(false);
                if (!xd.getEnableEventSendMessage())
                    xd.setEnableEventSendMessage(true);
                //4、并添加事件监听
                if (device.getInt("isMain") == 1) { //主设备添加传感器
                    //Log.i(TAG, "Main Device:" + device.getString("coreId"));
                    Handler dataHandler = new Handler() {
                        public void handleMessage(Message msg) {
                            try {
                                Bundle bundle = msg.getData();
                                JSONObject jo = new JSONObject();
                                for (String key : bundle.keySet()) {
                                    jo.put(key, bundle.get(key));
                                }
                                Log.i(TAG, "receive main sensor msg:" + jo.toString());
                                WritableMap params = Arguments.createMap();
                                params.putString("data", jo.toString());
                                sendEvent(getReactApplicationContext(), "updateSensor", params);
                            } catch (Exception ex) {
                                Log.e(TAG, ex.getMessage());
                            }
                        }
                    };
                    xd.addDataEventHandler(dataHandler);
                }
                Handler deviceHandler = new Handler(getReactApplicationContext().getMainLooper()) {
                    public void handleMessage(Message msg) {
                        try {
                            Bundle bundle = msg.getData();
                            JSONObject jo = new JSONObject();
                            for (String key : bundle.keySet()) {
                                jo.put(key, bundle.get(key));
                            }
                            Log.i(TAG, "receive XDDevice msg:" + jo.toString());
                            WritableMap params = Arguments.createMap();
                            params.putString("data", jo.toString());
                            sendEvent(getReactApplicationContext(), "updateDevice", params);
                        } catch (Exception ex) {
                            Log.e(TAG, ex.getMessage());
                        }
                    }
                };
                xd.addDeviceEventHandler(deviceHandler);
                lstXltDevice.add(xd);
            }
            //5、发送查询状态方法
            //xd.QueryStatus(device.getInt("nodeNo"));
        } catch (Exception ex) {
            Log.e(TAG, ex.getMessage());
        }
    }

    private void sendEvent(ReactContext reactContext,
                           String eventName,
                           @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    /**
     * 断开连接
     */
    @ReactMethod
    public void DisConnect(String deviceId) {
        xltDevice xd = this.getXltDevice(deviceId);
        Log.i(TAG, "Disconnect deviceId : " + xd.getDeviceID());
        xd.clearDataEventHandlerList();
        xd.clearDeviceEventHandlerList();
        xd.Disconnect();
    }

    @ReactMethod
    public void Query(String deviceId, int nd) {
        xltDevice xd = this.getXltDevice(deviceId);
        xd.setDeviceID(nd);
        xd.QueryStatus();
    }

    /**
     * 执行批量命令
     *
     * @param args {命令的JsonArray}
     */
    @ReactMethod
    public void JSONCommandArray(String deviceId, String args) {
        try {
            JSONArray dataJson = new JSONArray(args);
            for (int i = 0; i < dataJson.length(); i++) {
                JSONObject objJson = dataJson.getJSONObject(i);
                this.JSONCommand(deviceId, objJson.toString());
            }
        } catch (Exception e) {
            Log.i(TAG, "JSONArray Convert Error");
        }
    }

    /**
     * 执行单个命令
     *
     * @param args
     */
    @ReactMethod
    public void JSONCommand(String deviceId, String args) {
        try {
            JSONObject dataJson = new JSONObject(args);
            this.JSONCommand(deviceId, dataJson);
        } catch (JSONException e) {
            Log.i(TAG, "JSON Convert Error");
        }
    }

    private void JSONCommand(String deviceId, JSONObject dataJson) {
        try {
            //xd.Connect(deviceId);
            xltDevice xd = this.getXltDevice(deviceId);
            int cmd = dataJson.getInt("cmd");
            int nodeId = dataJson.getInt("node_id");
            int sid = dataJson.has("sid") ? dataJson.getInt("sid") : 0;
            xd.setDeviceID(nodeId, sid);
            switch (cmd) {
                case 1:
                    //开关
                    int state = dataJson.getInt("state");
                    Log.i(TAG, String.format("%s -> %d -> PowerSwitch:%d", xd.getControllerID(), nodeId, state));
                    xd.PowerSwitch(state);
                    break;
                case 2:
                    //颜色
                    try {
                        JSONArray array = dataJson.getJSONArray("ring");
                        Log.i(TAG, String.format("%s -> %d -> ChangeColor:%s", xd.getControllerID(), nodeId, array.toString()));
                        xd.ChangeColor(array.getInt(0), array.getInt(1) == 0 ? false : true, array.getInt(2), array.getInt(3), array.getInt(4), array.getInt(5), array.getInt(6));
                    } catch (Exception e) {
                        Log.i(TAG, "Color JSON Convert Error," + e.getMessage());
                    }
                    break;
                case 3:
                    //亮度
                    int brightness = dataJson.getInt("value");
                    Log.i(TAG, String.format("%s -> %d -> ChangeBrightness:%d", xd.getControllerID(), nodeId, brightness));
                    xd.ChangeBrightness(brightness);
                    break;
                case 4:
                    //场景
                    int snt = dataJson.getInt("SNT_id");
                    Log.i(TAG, String.format("%s -> %d -> ChangeScenario:%d", xd.getControllerID(), nodeId, snt));
                    xd.ChangeScenario(snt);
                    break;
                case 5:
                    //色温
                    int cct = dataJson.getInt("value");
                    Log.i(TAG, String.format("%s -> %d -> ChangeCCT:%d", xd.getControllerID(), nodeId, cct));
                    xd.ChangeCCT(cct);
                    break;
                default:
                    Log.i(TAG, "Not Found cmd");
                    break;
            }
        } catch (Exception e) {
            Log.i(TAG, "Into Internal JSONCommand");
        }
    }

    private xltDevice getXltDevice(String deviceId) {
        xltDevice xd = null;
        for (xltDevice xlt : lstXltDevice) {
            if (xlt.getControllerID().equals(deviceId)) {
                xd = xlt;
                break;
            }
        }
        return xd;
    }

    /**
     * 开关灯
     *
     * @param state {bool}
     */
    @ReactMethod
    public void PowerSwitch(String deviceId, boolean state) {
        try {
            xltDevice xd = this.getXltDevice(deviceId);
            //进行控制
            final int iState = state ? 1 : 0;
            int rc = xd.PowerSwitch(iState);
            Log.d(this.TAG, "PowerSwitch Result:" + rc);
        } catch (Exception ex) {
            Log.e(this.TAG, ex.getMessage());
        }
    }
}
