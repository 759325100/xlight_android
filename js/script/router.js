/**
 * Created by 75932 on 2017/4/20.
 */
import React from "react";
import Dashboard from "../page/device";
import Login from "../page/login";
import * as  types from "../page/index";


const Router = {
    Index: {
        screen: types.Index,
    },
    Login: {
        screen: Login
    },
    Dashboard: {
        screen: Dashboard
    }
}

export default Router;