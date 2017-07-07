/**
 * Created by 75932 on 2017/4/19.
 */
import React from "react";
import {StyleSheet} from "react-native";
const Dimensions = require('Dimensions');
const {width, height} = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: "center"
    },
    statusBarColor: {},
    loginBgColor: {
        backgroundColor: "#0099FF"
    },
    input: {
        paddingLeft: 5,
        width: width - 40,
        backgroundColor: "transparent",
        marginBottom: 10,
        borderRadius: 5,
        borderColor: "#fff",
        borderWidth: .8
    },
    inputText: {
        height: 40,
        color: "#fff"
    },
    leftIcon: {
        flex: 1, paddingLeft: 15
    },
    rightIcon: {
        flex: 1,
        alignItems: "flex-end",
        paddingRight: 15
    },
    btnContainer: {
        width: width - 40,
        padding: 6,
        height: 40,
        overflow: 'hidden',
        borderRadius: 5,
        backgroundColor: "transparent",
        borderColor: "#fff",
        borderWidth: .8
    },
    btnDisabled: {
        borderColor: "rgba(255,255,255,0.5)"
    },
    fontDisabled:{
      opacity:.5
    },
    hackContainer: {
        backgroundColor: "#1F2229"
    },
    btnFont: {
        fontSize: 20,
        color: '#fff'
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    headerText: {
        color: "#fff",
        fontSize: 17
    },
    pt5: {
        paddingTop: 5
    }
    //...
});
export default styles;