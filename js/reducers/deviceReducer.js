/**
 * Created by 75932 on 2017/4/24.
 */
import * as types from "../action/actionType";

export default deviceReducer = (state = {
    devices: []
}, action) => {
    switch (action.type) {
        case types.SET_DEVICES:
            return {...state, devices: action.devices}
        case types.SET_OUTWEATHER:
            return {...state, ...action.info}
        case types.SET_SCENEID:
            return {...state, sceneId: action.id}
        case types.SET_DEVICE:
            return Object.assign({}, state, {
                devices: state.devices.map(device => {
                    return device.id == action.device.id ? {...device, ...action.device} : device;
                })
            });
        default:
            return state;
    }
}