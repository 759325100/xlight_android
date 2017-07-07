package com.internal;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGattCallback;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.support.annotation.Nullable;
import android.telecom.Call;
import android.text.TextUtils;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.common.ModuleDataCleaner;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.umarbhutta.xlightcompanion.SDK.xltDevice;

import org.json.JSONArray;
import org.json.JSONObject;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

/**
 * Created by 75932 on 2017/5/31.
 */
public class BLECommand extends ReactContextBaseJavaModule {
    BluetoothAdapter mBluetoothAdapter;
    private final static int REQUEST_ENABLE_BT = 1;
    private String TAG = "BLECommand";
    private List<BluetoothDevice> deviceList = new ArrayList<BluetoothDevice>();
    private boolean isRegister = false;
    BluetoothDevice mainBlue = null;
    private String[] wifiArray = new String[3];
    private xltDevice _xltDevice = null;
    private int step = 0;

    //构造函数
    public BLECommand(ReactApplicationContext reactContext) {
        super(reactContext);
        mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
    }

    Callback resultCallback = null;

    @ReactMethod
    public void connectBLE(String address, String wifi, String password, String capabilities, Callback callback) {
        if (_xltDevice == null) { //初始化连接对象
            _xltDevice = new xltDevice();
            _xltDevice.Init(this.getReactApplicationContext(), "", "");
            _xltDevice.setBridgePriority(xltDevice.BridgeType.BLE, 99);
            //_xltDevice.setAutoBridge(false);
            _xltDevice.useBridge(xltDevice.BridgeType.BLE);
        }
        step = 0;
        BluetoothDevice device;
        for (final BluetoothDevice bd : deviceList) {
            //清除非本次连接的其他xlight的蓝牙设备，确保每次连接到的是同一个蓝牙设备
            if (bd.getName().startsWith("xlight") && bd.getBondState() == BluetoothDevice.BOND_BONDED && !bd.getAddress().equals(address)) {
                try {
                    Method m = bd.getClass().getMethod("removeBond", (Class[]) null);
                    m.invoke(bd, (Object[]) null);
                } catch (Exception e) {
                    //忽略
                }
            }
            if (bd.getAddress().equals(address)) {
                mainBlue = bd;
            }
        }
        if (mainBlue != null) {
            wifiArray[0] = wifi;
            wifiArray[1] = password;
            wifiArray[2] = capabilities;
            //配对
            if (mainBlue.getBondState() == BluetoothDevice.BOND_BONDED) {
                try {
                    Log.i(TAG, "Pairing too");
                    ClsUtils.createBond(mainBlue.getClass(), mainBlue);
                    setWiFi();
                    callback.invoke(true);
                } catch (Exception ex) {
                    Log.e(TAG, ex.getMessage());
                }
            } else {
                try {
                    Log.d("BlueToothTestActivity", "开始配对");
                    Method createBondMethod = BluetoothDevice.class
                            .getMethod("createBond");
                    Boolean returnValue = (Boolean) createBondMethod.invoke(mainBlue);
                    resultCallback = callback;
                    if (resultCallback == null)
                        Log.i(TAG, "ResultCallback is null");
                    else
                        Log.i(TAG, "ResultCallback is not null");
                } catch (Exception ex) {
                    Log.e(TAG, ex.getMessage());
                }
            }
        }
    }

    @ReactMethod
    public void getBLEList(Callback error) {
        if (mBluetoothAdapter == null) {
            error.invoke();
            return;
        }
        if (!mBluetoothAdapter.isEnabled()) {
            //弹出对话框提示用户是后打开
            //Intent enabler = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            //this.getReactApplicationContext().startActivityForResult(enabler, REQUEST_ENABLE_BT);
            mBluetoothAdapter.enable();
        } else {
            mBluetoothAdapter.cancelDiscovery();
            mBluetoothAdapter.startDiscovery();
        }
        //确保只加一个广播监听
        if (isRegister)
            return;
        IntentFilter filter = new IntentFilter();
        //发现设备
        filter.addAction(BluetoothDevice.ACTION_FOUND);
        //设备连接状态改变
        filter.addAction(BluetoothDevice.ACTION_BOND_STATE_CHANGED);
        //蓝牙设备状态改变
        filter.addAction(BluetoothAdapter.ACTION_STATE_CHANGED);
        filter.addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED);
        this.getReactApplicationContext().registerReceiver(mBluetoothReceiver, filter);
        isRegister = true;
    }

    @ReactMethod
    public void stopScan() {
        if (mBluetoothAdapter == null) {
            mBluetoothAdapter.cancelDiscovery();
        }
    }

    private void setWiFi() {
        if (_xltDevice.isBLEOK()) {
            setBluetooth();
        } else {
            Handler m_bcsHandler = new Handler() {
                public void handleMessage(Message msg) {
                    String bridgeName = (String) msg.obj;
                    switch (msg.what) {
                        case xltDevice.BCS_CONNECTED:
                            break;
                        case xltDevice.BCS_NOT_CONNECTED:
                        case xltDevice.BCS_CONNECTION_FAILED:
                        case xltDevice.BCS_CONNECTION_LOST:
                            break;
                        case xltDevice.BCS_FUNCTION_ACK:
                            Toast.makeText(getReactApplicationContext(), (msg.arg1 == 1 ? "OK" : "Failed"), Toast.LENGTH_SHORT).show();
                            if (step == 1) {
                                if (wifiArray[2].contains("WPA2")) {
                                    //做一点事
                                    _xltDevice.sysWiFiSetup(wifiArray[0], wifiArray[1], xltDevice.WLAN_SEC_WPA2);
                                } else if (wifiArray[2].contains("WPA")) {
                                    //做一点事
                                    _xltDevice.sysWiFiSetup(wifiArray[0], wifiArray[1], xltDevice.WLAN_SEC_WPA);
                                } else if (wifiArray[2].contains("WEP")) {
                                    //做一点事
                                    _xltDevice.sysWiFiSetup(wifiArray[0], wifiArray[1], xltDevice.WLAN_SEC_WEP);
                                } else {
                                    _xltDevice.sysWiFiSetup(wifiArray[0], wifiArray[1], xltDevice.WLAN_SEC_UNSEC);
                                }
                                step++;
                            } else if (step == 2) {
                                Log.i(TAG, "ControllerID:" + _xltDevice.sysQueryCoreID());
                                _xltDevice.sysControl("reset");
                                step++;
                                _xltDevice.Disconnect();
                                _xltDevice = null;
                            }
                            break;
                        case xltDevice.BCS_FUNCTION_COREID:
                            Toast.makeText(getReactApplicationContext(), "CoreID: " + bridgeName, Toast.LENGTH_LONG).show();
                            break;
                    }
                }
            };
            _xltDevice.Connect("", m_bcsHandler, new xltDevice.callbackConnect() {
                @Override
                public void onConnected(xltDevice.BridgeType bridge, boolean connected) {
                    setBluetooth();
                }
            });
        }
    }

    private void setBluetooth() {
        Log.i(TAG, "蓝牙可用:" + _xltDevice.isBLEOK());
        _xltDevice.sysControl("clear credentials");
        Log.i(TAG, "清除当前Wi-Fi信息:" + _xltDevice.isBLEOK());
        step++;
//        Timer timer = new Timer();
//        timer.schedule(new TimerTask() {
//            @Override
//            public void run() {
//                Log.i(TAG, "蓝牙可用:" + _xltDevice.isBLEOK());
//                _xltDevice.sysControl("clear credentials");
//                Log.i(TAG, "清除当前Wi-Fi信息:" + _xltDevice.isBLEOK());
//            }
//        }, 0);
//        timer.schedule(new TimerTask() {
//            @Override
//            public void run() {

//            }
//        }, 200);
//        timer.schedule(new TimerTask() {
//            @Override
//            public void run() {
//            }
//        }, 400);
        //_xltDevice.Disconnect();
    }

    private BroadcastReceiver mBluetoothReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            Log.d(TAG, "mBluetoothReceiver action =" + action);
            if (BluetoothDevice.ACTION_FOUND.equals(action)) {//每扫描到一个设备，系统都会发送此广播。
                //获取蓝牙设备
                BluetoothDevice scanDevice = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                if (scanDevice == null || scanDevice.getName() == null) return;
                Log.d(TAG, "name=" + scanDevice.getName() + "address=" + scanDevice.getAddress());
                //蓝牙设备名称
                String name = scanDevice.getName();
                deviceList.add(scanDevice);
//                if (name != null && name.equals("Xlight")) {
//                    mBluetoothAdapter.cancelDiscovery();
//                    WritableMap params = Arguments.createMap();
//                    params.putString("data", "ok");
//                    sendEvent(getReactApplicationContext(), "foundBLESuccess", params);
//                }
                try {
                    WritableMap params = Arguments.createMap();
                    JSONObject jo = new JSONObject();
                    jo.put("name", scanDevice.getName());
                    jo.put("address", scanDevice.getAddress());
                    params.putString("data", jo.toString());
                    sendEvent(getReactApplicationContext(), "foundBLE", params);
                } catch (Exception ex) {
                    Log.e(TAG, ex.getMessage());
                }
            } else if (BluetoothAdapter.ACTION_DISCOVERY_FINISHED.equals(action)) {
                try {
                    WritableMap params = Arguments.createMap();
//                    JSONArray jarray = new JSONArray();
//                    for (BluetoothDevice bd : deviceList) {
//                        JSONObject jo = new JSONObject();
//                        jo.put("name", bd.getName());
//                        jo.put("address", bd.getAddress());
//                        jarray.put(jo);
//                    }
                    Log.i(TAG, "蓝牙扫描结束");
                    params.putString("data", "ok");
                    sendEvent(getReactApplicationContext(), "foundBLESuccess", params);
                } catch (Exception ex) {
                    Log.e(TAG, ex.getMessage());
                }
            } else if (BluetoothAdapter.ACTION_STATE_CHANGED.equals(action)) {
                if (mBluetoothAdapter.enable())
                    mBluetoothAdapter.startDiscovery();
                else
                    mBluetoothAdapter.cancelDiscovery();
            } else if (action.equals("android.bluetooth.device.action.BOND_STATE_CHANGED")) {
                if (mainBlue != null) {
                    if (mainBlue.getBondState() == BluetoothDevice.BOND_BONDED) {
                        Log.i(TAG, "配对成功");
                        if (resultCallback != null) {
                            Log.i(TAG, "ResultCallback invoke");
                            //进行WiFi设置
                            setWiFi();
                            resultCallback.invoke(true);
                            resultCallback = null;
                        }
                    } else if (mainBlue.getBondState() == BluetoothDevice.BOND_NONE) {
                        Log.i(TAG, "配对失败");
                        if (resultCallback != null) {
                            Log.i(TAG, "ResultCallback invoke");
                            resultCallback.invoke(false);
                            resultCallback = null;
                        }
                    }
                    //resultCallback = null;
                }
            }
        }

    };

    private void sendEvent(ReactContext reactContext,
                           String eventName,
                           @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @Override
    public String getName() {
        return "BLECommand";
    }
}
