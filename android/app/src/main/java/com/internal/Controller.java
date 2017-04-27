package com.internal;

import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.telecom.Call;
import android.util.Log;

import com.facebook.infer.annotation.Strict;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
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

    //设备消息监听器
    Handler deviceHandler = null;

    //数据消息监听器
    Handler dataHandler = null;

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
        } catch (Exception e) {
            Log.e(TAG, e.getMessage());
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
        //连接设备之前，进行其他设备监听移除
        xd.Connect(deviceId);
    }

    /**
     * 断开连接
     */
    @ReactMethod
    public void DisConnect() {

    }

//    @ReactMethod
//    public void SendMessage() {
//        try {
//            Log.i(this.TAG, "Init SendMessage");
//            //xd.setEnableEventSendMessage(true);
//            final Bundle bundle = new Bundle();
//            bundle.putString("Data", "this is test");
//            xd.sendDeviceStatusMessage(bundle);
//        } catch (Exception e) {
//            Log.e(TAG, e.getMessage());
//        }
//    }

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

    /**
     * 添加事件监听
     *
     * @param type     {要监听的事件类型 0全部 1设备 2数据}
     * @param callback {有数据的回调函数}
     */
    @ReactMethod
    public void ListenEvent(int type, final Callback callback) {
        try {
            if (!xd.getEnableEventSendMessage()) {
                xd.setEnableEventSendMessage(true);
            }
            //移除事件，为保证效率，只能绑定一个通知
            if (deviceHandler != null)
                xd.removeDeviceEventHandler(deviceHandler);
            if (dataHandler != null)
                xd.removeDataEventHandler(dataHandler);
            Log.i(this.TAG, "Init ListenEvent");
            deviceHandler = new Handler() {
                public void handleMessage(Message msg) {
                    Log.i(TAG, "receive device msg:" + msg.toString());
                    callback.invoke(1, msg.toString());
                }
            };
            xd.addDeviceEventHandler(deviceHandler);
            Handler dataHandler = new Handler() {
                public void handleMessage(Message msg) {
                    Log.i(TAG, "receive data msg:" + msg.toString());
                    callback.invoke(2, msg.toString());
                }
            };
            xd.addDataEventHandler(dataHandler);
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
