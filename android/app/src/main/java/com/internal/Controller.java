package com.internal;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.support.annotation.Nullable;
import android.telecom.Call;
import android.util.Log;

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

/**
 * Created by 75932 on 2017/4/17.
 * 设备控制类
 */
public class Controller extends ReactContextBaseJavaModule {
    private xltDevice xd;
    private xltDevice xdData;
    private final String TAG = "Controller";
    private String deviceId = null;

    //构造函数
    public Controller(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "Controller";
    }

    /**
     * 初始化连接
     */
    @ReactMethod
    public void Init(String username, String password) {
        try {
            Log.i(TAG, "Init xltDevice");
            xd = new xltDevice();
            xd.Init(getReactApplicationContext(), username, password);
            //强制使用云端
            xd.useBridge(xltDevice.BridgeType.Cloud);
            //不适用自动选择
            xd.setAutoBridge(false);
            //关闭广播监听
            xd.setEnableEventBroadcast(false);
            //备用
            xdData = new xltDevice();
            xdData.Init(getReactApplicationContext(), username, password);
            xdData.useBridge(xltDevice.BridgeType.Cloud);
            xdData.setAutoBridge(false);
            xdData.setEnableEventBroadcast(false);
        } catch (Exception e) {
            Log.e(TAG, e.getMessage());
        }
    }

    private void sendEvent(ReactContext reactContext,
                           String eventName,
                           @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @ReactMethod
    public void ConnectMain(String deviceId) {
        try {
            xdData.Connect(deviceId);
            //测试广播
//            IntentFilter intentFilter = new IntentFilter(xltDevice.bciDeviceStatus);
//            intentFilter.setPriority(3);
//            if (!xdData.getEnableEventBroadcast())
//                xdData.setEnableEventBroadcast(true);
//            this.getReactApplicationContext().registerReceiver(new BroadcastReceiver() {
//                @Override
//                public void onReceive(Context context, Intent intent) {
//                    Log.i(TAG, "INTENT RECEIVED by " + TAG);
//                }
//            }, intentFilter);
            if (!xdData.getEnableEventSendMessage()) {
                xdData.setEnableEventSendMessage(true);
            }
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
            //移除事件，为保证效率，只能绑定一个通知
            if (dataHandler != null)
                xdData.removeDataEventHandler(dataHandler);
            Log.i(this.TAG, "Init Main ListenEvent");
            xdData.addDataEventHandler(dataHandler);
        } catch (Exception ex) {
            Log.e(this.TAG, ex.getMessage());
        }
    }

    /**
     * 判断指定设备是否已经连接
     *
     * @param deviceId {要判断的设备I}
     * @param callback {判断后的结果回调}
     */
    @ReactMethod
    public void IsConnected(String deviceId, Callback callback) {
        if (deviceId != null && deviceId.equals(this.deviceId)) {
            callback.invoke(true);
        } else {
            callback.invoke(false);
        }
    }

    /**
     * 连接指定设备
     *
     * @param deviceId
     */
    @ReactMethod
    public void Connect(String deviceId) {
        Log.i(TAG, "Connecting:" + deviceId);
        //判断当前连接的deviceId就是将要连接的，return
        if (xd.getControllerID() == deviceId)
            return;
        //连接设备之前，进行其他设备监听移除
        xd.Connect(deviceId);
    }

    /**
     * 断开连接
     */
    @ReactMethod
    public void DisConnect() {
        Log.i(TAG, "Disconnect deviceId : " + xd.getDeviceID());
        xd.clearDataEventHandlerList();
        xd.clearDeviceEventHandlerList();
        xd.Disconnect();
    }

    /**
     * 执行批量命令
     *
     * @param args {命令的JsonArray}
     */
    @ReactMethod
    public void JSONCommandArray(String args) {
        try {
            JSONArray dataJson = new JSONArray(args);
            for (int i = 0; i < dataJson.length(); i++) {
                JSONObject objJson = dataJson.getJSONObject(i);
                this.JSONCommand(objJson.toString());
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
    public void JSONCommand(String args) {
        try {
            JSONObject dataJson = new JSONObject(args);
            this.JSONCommand(dataJson);
        } catch (JSONException e) {
            Log.i(TAG, "JSON Convert Error");
        }
    }

    private void JSONCommand(JSONObject dataJson) {
        try {
            int cmd = dataJson.getInt("cmd");
            int nodeId = dataJson.getInt("node_id");
            xd.setDeviceID(nodeId);
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

    //设备消息监听器
    Handler deviceHandler = new Handler(getReactApplicationContext().getMainLooper()) {
        public void handleMessage(Message msg) {
            try {
                Bundle bundle = msg.getData();
                JSONObject jo = new JSONObject();
                for (String key : bundle.keySet()) {
                    jo.put(key, bundle.get(key));
                }
                Log.i(TAG, "receive main XDDevice msg:" + jo.toString());
                WritableMap params = Arguments.createMap();
                params.putString("data", jo.toString());
                sendEvent(getReactApplicationContext(), "updateXDDevice", params);
            } catch (Exception ex) {
                Log.e(TAG, ex.getMessage());
            }
        }
    };

    //数据消息监听器
    Handler dataHandler = new Handler(getReactApplicationContext().getMainLooper()) {
        public void handleMessage(Message msg) {
            try {
                Bundle bundle = msg.getData();
                JSONObject jo = new JSONObject();
                for (String key : bundle.keySet()) {
                    jo.put(key, bundle.get(key));
                }
                Log.i(TAG, "receive main XDSensor msg:" + jo.toString());
                WritableMap params = Arguments.createMap();
                params.putString("data", jo.toString());
                sendEvent(getReactApplicationContext(), "updateXDSensor", params);
            } catch (Exception ex) {
                Log.e(TAG, ex.getMessage());
            }
        }
    };

    /**
     *
     */
    @ReactMethod
    public void RemoveListenEvent() {
        Log.i(TAG, "remove event listen");
        if (dataHandler != null) {
            boolean result = xd.removeDataEventHandler(dataHandler);
            Log.i(TAG, "clear all dataEvent result:" + result);
        }
        if (deviceHandler != null) {
            boolean result = xd.removeDeviceEventHandler(deviceHandler);
            Log.i(TAG, "remove deviceEvent result:" + result);
        }
    }

    /**
     * 添加事件监听
     *
     * @param type {要监听的事件类型 0全部 1设备 2数据}
     */
    @ReactMethod
    public void ListenEvent(int type, int nd) {
        try {
            if (!xd.getEnableEventSendMessage()) {
                xd.setEnableEventSendMessage(true);
            }
            //移除事件，为保证效率，只能绑定一个通知
            xd.clearDeviceEventHandlerList();
            xd.clearDataEventHandlerList();
            Log.i(this.TAG, "Init ListenEvent");
            if (type == 0 || type == 1) {
                xd.addDeviceEventHandler(deviceHandler);
            }
            if (type == 0 || type == 2)
                xd.addDataEventHandler(dataHandler);
            xd.setDeviceID(nd);
            Log.i(TAG, "query node_id=" + nd);
        } catch (Exception ex) {
            Log.e(this.TAG, ex.getMessage());
        }
    }

    /**
     * 开关灯
     *
     * @param state {bool}
     */
    @ReactMethod
    public void PowerSwitch(boolean state) {
        try {
            //进行控制
            final int iState = state ? 1 : 0;
            int rc = xd.PowerSwitch(iState);
            Log.d(this.TAG, "PowerSwitch Result:" + rc);
        } catch (Exception ex) {
            Log.e(this.TAG, ex.getMessage());
        }
    }
}
