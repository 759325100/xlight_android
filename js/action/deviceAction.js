/**
 * Created by 75932 on 2017/4/24.
 */
import * as types from "./actionType";

export const setDevices = devices => ({
    type: types.SET_DEVICES,
    devices: devices
});

export const setOutWeather = info => ({
    type: types.SET_OUTWEATHER,
    info
})

export const setSceneId = id => ({
    type: types.SET_SCENEID,
    id: id
})

export const setDevice = device => ({
    type: types.SET_DEVICE,
    device: device
})
