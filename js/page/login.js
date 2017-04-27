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
    ScrollView,
    ToastAndroid,
    NativeModules,
    BackAndroid,
    ActivityIndicator
} from "react-native";
import Button from "react-native-button";
import TextField from "react-native-md-textinput";
import {connect} from "react-redux";
import {setUser} from "../action/userAction";
import base from "../styles/base";
import api from "../script/api";
const Controller = NativeModules.Controller;

class Login extends Component {
    constructor(props) {
        super(props)
        this.state = {
            email: "",
            password: "",
            login: false
        }
    }

    toastFont = this.props.state.language.Toast;
    //保存用户信息
    login = () => {
        //检查用户信息
        if (this.state.email == "") {
            ToastAndroid.show(this.toastFont.emailEmpty, ToastAndroid.SHORT);
        } else if (this.state.password == "") {
            ToastAndroid.show(this.toastFont.passwordEmpty, ToastAndroid.SHORT);
        } else {
            //开始登录
            this.setState({login: true});
            const {dispatch} = this.props;
            //自动登录，获取AccessToken
            fetch(api.user.login, {
                method: 'POST',
                headers: api.headers,
                body: JSON.stringify({
                    username: this.state.email,
                    password: this.state.password,
                })
            }).then((ret) => ret.json()).then((ret) => {
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
                    //到设备页
                    this.props.navigation.navigate("Device");
                } else {
                    ToastAndroid.show(this.toastFont.userError, ToastAndroid.SHORT);
                    this.setState({login: false});
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
        let loginFont = this.props.state.language.Page.Login;
        return (
            <View style={[base.container,styles.container]}>
                <StatusBar hidden={false} backgroundColor={"#1DA4DE"}/>
                <View style={styles.icon}>
                    <Image source={require("../../assets/images/xlt_160.png")} style={{width:50,height:50}}></Image>
                </View>
                <View style={styles.form}>
                    <View>
                        <TextField inputStyle={styles.input} label={loginFont.inputEmail} highlightColor={'#fff'}
                                   labelColor={"#fff"}
                                   textColor={"#fff"} keyboardType={'email-address'}
                                   onChangeText={(value)=>{
                        this.setState({email:value})
                    }} value={this.state.email}/>
                    </View>
                    <View >
                        <TextField inputStyle={styles.input} label={loginFont.inputPassword} secureTextEntry={true}
                                   highlightColor={'#fff'} labelColor={"#fff"} textColor={"#fff"} onChangeText={(value)=>{
                                   this.setState({password:value})
                               }} value={this.state.password}/>
                    </View>
                    <View style={{alignItems:"flex-end"}}>
                        <Text style={styles.forget}>{loginFont.forgetPassword}</Text>
                    </View>
                    <View style={styles.button}>
                        <Button
                            style={[styles.signBtn,styles.size20]}
                            containerStyle={[styles.signContainer,styles.btnContainer]}
                            onPress={() => this.login()}
                            disabled={this.state.login}
                            styleDisabled={styles.btnDisabled}
                        >
                            {loginFont.loginBtn}
                        </Button>
                    </View>
                    <View style={styles.button}>
                        <Button
                            style={[styles.registerBtn,styles.size20]}
                            containerStyle={[styles.registerContainer,styles.btnContainer]}
                            onPress={() => {}}>
                            {loginFont.registerBtn}
                        </Button>
                    </View>
                    {this.state.login ? (<View>
                            <ActivityIndicator color={"white"} animating={this.state.login} size='large'/>
                        </View>) : (<View></View>)}

                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1DA4DE',
    },
    icon: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    form: {
        flex: 5
    },
    size20: {
        fontSize: 20
    },
    signBtn: {
        color: '#1DA4DE'
    },
    btnDisabled: {
        color: "gray"
    },
    btnContainer: {
        padding: 6, height: 40, overflow: 'hidden', borderRadius: 20,
    },
    signContainer: {
        backgroundColor: 'white'
    },
    registerBtn: {
        color: 'white',
    },
    registerContainer: {
        backgroundColor: '#1DA4DE',
        borderWidth: 1,
        borderColor: "white"
    },
    button: {
        paddingTop: 15
    },
    forget: {
        color: "white",
        marginTop: 5
    },
    input: {
        width: 220,
        height: 40
    }
});

const mapStateToProps = (state) => ({
    state: state.indexReducer
});


export default connect(mapStateToProps)(Login);