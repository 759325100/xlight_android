/**
 * Created by 75932 on 2017/4/14.
 */
'use strict'
import React, {Component} from "react";
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableNativeFeedback,
    StatusBar,
    ToastAndroid,
    NativeModules,
    ActivityIndicator,
    TouchableOpacity,
    TextInput
} from "react-native";
import {connect} from "react-redux";
import base from "../styles/base";
import {setUser} from "../action/userAction";
import {api, router} from "../script/api";
import {XIonic} from "../component/XIcon";
import Button from "react-native-button";
import Modal from "react-native-modal";
import * as Tool from "../script/tool";
import {setting} from "../script/setting";
import {NavigationActions} from "react-navigation";
const Controller = NativeModules.Controller;

const resetAction = NavigationActions.reset({
    index: 0,
    actions: [
        NavigationActions.navigate({routeName: 'Device'})
    ]
})

class Login extends Component {
    constructor(props) {
        super(props)
        this.state = {
            email: "",
            password: "",
            login: false,
            empty: true
        }
    }

    toastFont = this.props.state.language.Toast;
    check = () => {
        if (this.state.email && this.state.password)
            this.setState({empty: false});
        else
            this.setState({empty: true});
    }
    //保存用户信息
    login = () => {
        //检查邮箱
        if (!Tool.regEmail(this.state.email)) {
            ToastAndroid.show(this.toastFont.emailValid, ToastAndroid.SHORT);
        } else {
            //开始登录
            this.setState({login: true});
            const {dispatch} = this.props;
            //登录，获取AccessToken
            api.post(router.user.login, {
                username: this.state.email,
                password: this.state.password
            }).then((ret) => {
                if (ret.code == 1) {
                    //初始化设备
                    Controller.Init(this.state.email, this.state.password);
                    dispatch(setUser(ret.data[0]));
                    //保存用户信息
                    storage.save({
                        key: "userInfo",
                        rawData: {
                            email: this.state.email,
                            password: this.state.password,
                        },
                        expires: null
                    });
                    this.setState({login: false});
                    //到设备页
                    this.props.navigation.dispatch(resetAction);
                } else {
                    this.setState({login: false});
                    ToastAndroid.show(this.toastFont.userError, ToastAndroid.SHORT);
                }
            }).catch((error) => {
                //请求异常
                ToastAndroid.show(this.toastFont.timeout, ToastAndroid.SHORT);
                this.setState({login: false});
            });
        }
    }

    render() {
        //const {params} = this.props.navigation.state;
        const loginFont = this.props.state.language.Page.Login;
        const inputProp = {
            autoFocus: true,
            autoCorrect: false,
            placeholderTextColor: "#fff",
            underlineColorAndroid: "transparent",
            maxLength: 50
        }

        return (
            <View style={[styles.container,base.loginBgColor]}>
                <StatusBar hidden={false} translucent={true} animated={true}></StatusBar>
                <View style={[base.header,{marginTop:this.props.state.marginTop}]}>
                    <View style={base.leftIcon}>
                        <TouchableOpacity
                            onPress={()=>{this.props.navigation.goBack()}}>
                            <View>
                                <XIonic name="ios-arrow-back" color={setting.header.iconColor}
                                        size={setting.header.iconSize}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{flex:5,alignItems:"center"}}>
                        <Text style={base.headerText}>{loginFont.loginBtn}</Text>
                    </View>
                    <View style={base.rightIcon}></View>
                </View>
                <View style={styles.content}>
                    <View style={{alignItems:"center"}}>
                        <Image source={require("../../assets/images/logo.png")} style={styles.logo}></Image>
                    </View>
                    <View style={{marginTop:20,alignItems:"center"}}>
                        <View style={base.input}>
                            <TextInput
                                style={base.inputText} placeholder={loginFont.inputEmail} {...inputProp}
                                onChangeText={(text) => this.setState({email:text},this.check)}
                                value={this.state.email}
                            />
                        </View>
                        <View style={base.input}>
                            <TextInput
                                style={base.inputText} placeholder={loginFont.inputPassword} {...inputProp}
                                autoFocus={false}
                                secureTextEntry={true}
                                onChangeText={(text) => this.setState({password:text},this.check)}
                                value={this.state.password}
                            />
                        </View>
                    </View>
                    <View style={{alignItems:"center",paddingTop:20}}>
                        <Button
                            style={[base.btnFont]}
                            containerStyle={[base.btnContainer,this.state.empty&&base.btnDisabled]}
                            onPress={() => this.login()}
                            styleDisabled={base.fontDisabled}
                            disabled={this.state.empty}>
                            {loginFont.loginBtn}
                        </Button>
                    </View>
                    <View style={styles.linkView}>
                        <View style={styles.linkLeft}>
                            <TouchableOpacity
                                onPress={()=>{this.props.navigation.navigate("Forget")}}>
                                <View>
                                    <Text style={styles.linkColor}>{loginFont.forgetPassword}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.linkRight}>
                            <TouchableOpacity
                                onPress={()=>{this.props.navigation.navigate("SignUp")}}>
                                <View>
                                    <Text style={ styles.linkColor}>{loginFont.registerBtn}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <Modal isVisible={this.state.login}>
                    <View style={styles.containerCenter}>
                        <View
                            style={styles.modal}>
                            <ActivityIndicator color={"#fff"} animating={true} size='large'></ActivityIndicator>
                            <View>
                                <Text style={{color:"#fff"}}>
                                    {this.toastFont.logging}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }
}

const Dimensions = require('Dimensions');
const {width, height} = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    containerCenter: {
        flex: 1, justifyContent: "center", alignItems: "center"
    },
    modal: {
        height: 80,
        width: 80,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        alignItems: "center",
        justifyContent: "center"
    },
    logo: {
        width: 100,
        height: 60
    },
    content: {
        flex: 1, padding: 10, paddingTop: 30
    },
    linkView: {
        flexDirection: "row", justifyContent: "space-around", paddingTop: 20
    },
    linkLeft: {
        flex: 1, paddingLeft: 10
    },
    linkRight: {
        flex: 1, alignItems: "flex-end", paddingRight: 10
    },
    linkColor: {
        color: "#fff"
    }
});

const mapStateToProps = (state) => ({
    state: state.indexReducer
});


export default connect(mapStateToProps)(Login);