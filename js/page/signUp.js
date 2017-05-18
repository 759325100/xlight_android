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
import {XIonic} from "../component/XIcon";
import {setUser} from "../action/userAction";
import Button from "react-native-button";
import base from "../styles/base";
import Modal from "react-native-modal";
import {api, router} from "../script/api";
import * as Tool from "../script/tool";
const Controller = NativeModules.Controller;
class Login extends Component {
    constructor(props) {
        super(props)
        this.state = {
            email: "",
            password: "",
            confirmPassword: "",
            code: "",
            step: 1,
            emailEmpty: true,
            codeEmpty: true,
            passwordEmpty: true,
            eyeVisible: false,
            login: false
        }
    }

    toastFont = this.props.state.language.Toast;
    check = () => {
        if (this.state.email)
            this.setState({emailEmpty: false});
        else
            this.setState({emailEmpty: true});
        if (this.state.code)
            this.setState({codeEmpty: false});
        else
            this.setState({codeEmpty: true});
        if (this.state.password && this.state.confirmPassword)
            this.setState({passwordEmpty: false});
        else
            this.setState({passwordEmpty: true});
    }

    login = () => {
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
                this.setState({step: 4});
                //到设备页
                this.props.navigation.navigate("Device");
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
    next = () => {
        if (this.state.step == 1) {
            if (!Tool.regEmail(this.state.email)) {
                ToastAndroid.show(this.toastFont.emailValid, ToastAndroid.SHORT);
                return;
            }
            //判断用户是否存在，并发送验证码（缺少）
            api.post(router.user.exist, {
                email: this.state.email
            }).then(ret => {
                if (ret.code == 1) {
                    //下一步
                    this.setState({step: 2});
                } else if (ret.code == 0) {
                    ToastAndroid.show(this.toastFont.userExist, ToastAndroid.SHORT);
                } else {
                    ToastAndroid.show(this.toastFont.apiError, ToastAndroid.SHORT);
                }
            }).catch(err => {
                ToastAndroid.show(this.toastFont.timeout, ToastAndroid.SHORT);
            });
        } else if (this.state.step == 2) {
            //验证码验证（缺少）
            this.setState({step: 3});
        } else if (this.state.step == 3) {
            //进行密码验证
            if (this.state.password != this.state.confirmPassword) {
                ToastAndroid.show(this.toastFont.passwordNoMatch, ToastAndroid.SHORT);
                return;
            }
            this.setState({login: true});
            //创建用户
            api.post(router.user.signUp, {
                username: this.state.email,
                password: this.state.password
            }).then(ret => {
                if (ret.code == 1) {
                    //调用登录
                    this.login();
                } else {
                    ToastAndroid.show(this.toastFont.apiError, ToastAndroid.SHORT);
                    this.setState({login: false});
                }
            }).catch(err => {
                ToastAndroid.show(this.toastFont.timeout, ToastAndroid.SHORT);
                this.setState({login: false});
            })
        }
    }

    render() {
        //const {params} = this.props.navigation.state;
        const signUpFont = this.props.state.language.Page.SignUp;
        const loginFont = this.props.state.language.Page.Login;
        const inputProp = {
            autoFocus: true,
            autoCorrect: false,
            placeholderTextColor: "#fff",
            underlineColorAndroid: "transparent"
        }
        const header = (<View style={[base.header]}>
            <View style={base.leftIcon}>
                <TouchableOpacity
                    onPress={()=>{this.state.step == 1? this.props.navigation.goBack():this.setState({step:this.state.step-1});}}>
                    <View>
                        <XIonic name="ios-arrow-back" color={"#fff"} size={28}/>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={{flex:5,alignItems:"center"}}>
                <Text style={base.headerText}>{loginFont.registerBtn}</Text>
            </View>
            <View style={base.rightIcon}></View>
        </View>);
        return (
            <View style={[styles.container,base.loginBgColor]}>
                <StatusBar hidden={false} translucent={true} animated={true}></StatusBar>
                <View style={{marginTop:this.props.state.marginTop}}>
                    {header}
                </View>
                <View style={styles.content}>
                    <View style={{alignItems:"center"}}>
                        <Image source={require("../../assets/images/xlt_160.png")} style={styles.logo}></Image>
                    </View>
                    <View style={{marginTop:20,alignItems:"center"}}>
                        <View style={base.input}>
                            <TextInput
                                style={base.inputText} placeholder={loginFont.inputEmail} {...inputProp}
                                onChangeText={(text) => this.setState({email:text},this.check)}
                                value={this.state.email}
                            />
                        </View>
                    </View>
                    <View style={styles.fontView}>
                        <Text style={styles.linkColor}>{signUpFont.remark}
                            <Text style={[styles.linkColor,styles.underline]} onPress={()=>{}}>{signUpFont.terms}</Text>
                            <Text style={styles.linkColor}>{signUpFont.and}</Text>
                            <Text style={[styles.linkColor,styles.underline]}
                                  onPress={()=>{}}>{signUpFont.policy}</Text>
                        </Text>
                    </View>
                    <View style={styles.itemView}>
                        <Button
                            style={[base.btnFont]}
                            containerStyle={[base.btnContainer,this.state.emailEmpty&&base.btnDisabled]}
                            onPress={() => this.next()}
                            disabled={this.state.emailEmpty}>
                            {signUpFont.next}
                        </Button>
                    </View>
                    <View style={styles.linkView}>
                        <View>
                            <TouchableOpacity
                                onPress={()=>{this.props.navigation.navigate("SignIn")}}>
                                <View>
                                    <Text style={styles.linkColor}>{loginFont.loginBtn}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <Modal isVisible={this.state.step==2} style={styles.clear} backdropOpacity={1}
                       onBackButtonPress={()=>this.setState({step:1})}>
                    <View style={[styles.container,base.loginBgColor,base.pt5]}>
                        {header}
                        <View>
                            <View style={styles.itemView}>
                                <View style={base.input}>
                                    <TextInput
                                        style={base.inputText} keyboardType="numeric" maxLength={4}
                                        placeholder={signUpFont.inputCode} {...inputProp}
                                        onChangeText={(text) => this.setState({code:text},this.check)}
                                        value={this.state.code}
                                    />
                                </View>
                                <View style={{ paddingLeft: 20}}>
                                    <Text style={styles.linkColor}>
                                        {signUpFont.verificationCode}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.itemView}>
                                <Button
                                    style={[base.btnFont]}
                                    containerStyle={[base.btnContainer,this.state.codeEmpty&&base.btnDisabled]}
                                    onPress={() => this.next()}
                                    disabled={this.state.codeEmpty}>
                                    {signUpFont.next}
                                </Button>
                            </View>

                        </View>
                    </View>
                </Modal>
                <Modal isVisible={this.state.step==3} style={styles.clear} backdropOpacity={1}
                       onBackButtonPress={()=>this.setState({step:2})}>
                    <View style={[styles.container,base.loginBgColor,base.pt5]}>
                        {header}
                        <View>
                            <View style={styles.itemView}>
                                <View style={[base.input,styles.rowInput]}>
                                    <TextInput
                                        style={[base.inputText,{flex:1}]} maxLength={20}
                                        placeholder={signUpFont.inputPassword} {...inputProp}
                                        secureTextEntry={!this.state.eyeVisible}
                                        onChangeText={(text) => this.setState({password:text},this.check)}
                                        value={this.state.password}
                                    />
                                    <TouchableOpacity
                                        onPress={()=>{this.setState({eyeVisible:!this.state.eyeVisible})}}>
                                        <View style={styles.eye}>
                                            <XIonic name={this.state.eyeVisible?"ios-eye-off":"ios-eye" } color={"#fff"}
                                                    size={30}/>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={[base.input,styles.rowInput]}>
                                    <TextInput
                                        style={[base.inputText,{flex:1}]} maxLength={20}
                                        secureTextEntry={!this.state.eyeVisible}
                                        placeholder={signUpFont.inputConfirmPassword} {...inputProp} autoFocus={false}
                                        onChangeText={(text) => this.setState({confirmPassword:text},this.check)}
                                        value={this.state.confirmPassword}
                                    />
                                    <TouchableOpacity
                                        onPress={()=>{this.setState({eyeVisible:!this.state.eyeVisible})}}>
                                        <View style={styles.eye}>
                                            <XIonic name={this.state.eyeVisible?"ios-eye-off":"ios-eye" } color={"#fff"}
                                                    size={30}/>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.itemView}>
                                <Button
                                    style={[base.btnFont]}
                                    containerStyle={[base.btnContainer,this.state.passwordEmpty&&base.btnDisabled]}
                                    onPress={() => this.next()}
                                    disabled={this.state.passwordEmpty}>
                                    {loginFont.loginBtn}
                                </Button>
                            </View>
                        </View>
                    </View>
                </Modal>
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

const
    Dimensions = require('Dimensions');
const {
    width,
    height
}= Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    containerCenter: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    modal: {
        height: 80,
        width: 80,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        alignItems: "center",
        justifyContent: "center"
    },
    hackContainer: {
        backgroundColor: "#1F2229"
    },
    logo: {
        width: 60,
        height: 60
    },
    content: {
        flex: 1, padding: 10, paddingTop: 30
    },
    rowInput: {
        flexDirection: "row",
        alignItems: "center"
    },
    itemView: {
        paddingTop: 20, alignItems: "center"
    },
    fontView: {
        flexDirection: "row",
        padding: 10
    },
    linkView: {
        flexDirection: "row", justifyContent: "space-around", paddingTop: 20
    },
    linkColor: {
        color: "#fff"
    },
    underline: {
        textDecorationLine: "underline"
    },
    clear: {
        margin: 0,
        padding: 0
    },
    eye: {
        paddingRight: 5
    }
});

const mapStateToProps = (state) => ({
    state: state.indexReducer
});


export default connect(mapStateToProps)(Login);