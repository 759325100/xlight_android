/**
 * Created by 75932 on 2017/4/19.
 * 通用的reducer也在此类中定义
 */
import {combineReducers} from "redux";
import * as types from "../action/actionType";
import frameReducer from "./frameReducer";
import userReducer from "./userReducer";
import deviceReducer from "./deviceReducer";

const initialNavState = {
    drawerMode: "locked-closed"
};

const indexReducer = (state = initialNavState, action) => {
    switch (action.type) {
        case types.REQUEST:
        case types.RESPONSE:
        case types.ERROR:
            return {
                ...state,
                [action.info]: posts(state[action.info], action)
            }
        case types.SET_LANGUAGE:
            return {...state, lanType: action.lanType, language: action.language};
        case types.SET_CURRENT_ROUTER:
            return {...state, routeName: action.routeName}
        case types.SET_SLIDERMENU:
            return {...state, drawer: action.drawer}
        case types.SET_MARGINTOP:
            return {...state, marginTop: action.marginTop}
        case types.SET_POSITION:
            return {...state, position: action.position}
        case types.SET_DRAWERMODE:
            return {...state, drawerMode: action.drawerMode}
        default:
            return state;
    }
}

const posts = (state = {
    isFetching: false,
    didInvalidate: false,
    error: false,
    data: []
}, action) => {
    switch (action.type) {
        case types.ERROR:
            return {
                ...state,
                error: true
            }
        case types.REQUEST:
            return {
                ...state,
                isFetching: true,
                didInvalidate: false,
                error: false
            }
        case types.RESPONSE:
            return {
                ...state,
                isFetching: false,
                didInvalidate: false,
                data: action.data
            }
        default:
            return state
    }
}

const rootReducer = combineReducers({
    frameReducer,
    indexReducer,
    userReducer,
    deviceReducer
});


export default rootReducer;