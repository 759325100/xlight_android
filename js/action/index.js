/**
 * Created by 75932 on 2017/4/19.
 * 通用的Action
 */
import * as types from "./actionType";

export const requestStart = info => ({
    type: types.REQUEST,
    info
});

export const requestEnd = (info, data) => ({
    type: types.RESPONSE,
    info,
    data
})

export const requestError = info => ({
    type: types.ERROR,
    info
})

export const setLanguage = (lanType, language) => ({
    type: types.SET_LANGUAGE,
    lanType: lanType,
    language: language
});

export const setCurrentRouter = (routeName) => ({
    type: types.SET_CURRENT_ROUTER,
    routeName: routeName
})

export const setSliderMenu = (drawer) => ({
    type: types.SET_SLIDERMENU,
    drawer: drawer
})

export const setSliderMode = (mode) => ({
    type: types.SET_DRAWERMODE,
    drawerMode: mode
})

export const setMarginTop = (value) => ({
    type: types.SET_MARGINTOP,
    marginTop: value
})

export const setPosition = (position) => ({
    type: types.SET_POSITION,
    position: position
})
