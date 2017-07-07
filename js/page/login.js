/**
 * Created by 75932 on 2017/4/14.
 */
'use strict'
import React, {Component} from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableNativeFeedback,
    StatusBar,
    Image,
    ToastAndroid,
    NativeModules,
    ActivityIndicator,
    TouchableOpacity
} from "react-native";
import {connect} from "react-redux";
import Button from "react-native-button";
import {XIonic} from "../component/XIcon";
import {setting} from "../script/setting";
const Controller = NativeModules.Controller;

class Login extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const loginFont = this.props.state.language.Page.Login;
        return (
            <Image source={require("../../assets/images/login.gif")} style={styles.backgroundImage}>
                <StatusBar hidden={false} translucent={true} animated={true}></StatusBar>
                <View style={[{flex:1},{marginTop:this.props.state.marginTop}]}>
                    <View style={styles.leftIcon}>
                        <TouchableOpacity
                            onPress={()=>{this.props.state.drawer.openDrawer()}}>
                            <View>
                                <XIonic name="ios-menu" color={setting.header.iconColor} size={setting.header.iconSize}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{flex:1,justifyContent:"flex-end"}}>
                    <View style={{flexDirection:"row",marginBottom:20, justifyContent:"space-around"}}>
                        <View >
                            <Button
                                style={[styles.btnFont]}
                                containerStyle={[styles.btnContainer]}
                                onPress={() => this.props.navigation.navigate("SignUp")}
                                styleDisabled={styles.btnDisabled}
                            >
                                {loginFont.registerBtn}
                            </Button>
                        </View>
                        <View>
                            <Button
                                style={[styles.btnFont]}
                                containerStyle={[styles.btnContainer,styles.hackContainer]}
                                onPress={() => this.props.navigation.navigate("SignIn")}
                                styleDisabled={styles.btnDisabled}
                            >
                                {loginFont.loginBtn}
                            </Button>
                        </View>
                    </View>
                </View>
            </Image>
        );
    }
}

const Dimensions = require('Dimensions');
const {width, height} = Dimensions.get('window');
const styles = StyleSheet.create({
    backgroundImage: {
        width: width,
        height: height,
        //祛除内部元素的白色背景
        backgroundColor: 'rgba(0,0,0,0)',
    },
    btnContainer: {
        width: width / 2 - 20, padding: 6, height: 40, overflow: 'hidden', borderRadius: 5, backgroundColor: "#5EB4CF"
    },
    hackContainer: {
        backgroundColor: "#1F2229"
    },
    btnFont: {
        fontSize: 20,
        color: '#fff'
    },
    leftIcon: {
        flex: 1, paddingLeft: 15
    },
});

const mapStateToProps = (state) => ({
    state: state.indexReducer
});


export default connect(mapStateToProps)(Login);