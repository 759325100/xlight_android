/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import {AppRegistry} from "react-native";
import React, {Component} from "react";
import AppWithNavigationState from "./js/main";
import {Provider} from "react-redux";
import configureStore from "./js/store/configureStore";

class App extends Component {
    store = configureStore();

    render() {
        return (
            <Provider store={this.store}>
                <AppWithNavigationState />
            </Provider>
        );
    }
}

//注册入口文件
AppRegistry.registerComponent('xlight', () => App);


