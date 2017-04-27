/**
 * Created by 75932 on 2017/4/24.
 */
import * as types from "../action/actionType";

export default deviceReducer = (state = {
    location: "N/A",
    outIcon: "code999",
    outTemperature: "N/A",
    outBodyTemperature: "N/A",
    outHumidity: "N/A",
    outRange: "N/A",
    roomTemperature: "N/A",
    roomHumidity: "N/A",
    roomBrightness: "N/A"
}, action) => {
    switch (action.type) {
        case types.SET_DEVICES:
            return {...state, devices: action.devices}
        case types.SET_OUTWEATHER:
            return {...state, ...action.info}
        case types.SET_SCENEID:
            return {...state, sceneId: action.id}
        default:
            return state;
    }
}