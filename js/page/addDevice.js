/**
 * Created by 75932 on 2017/4/14.
 */
'use strict'
import React, {Component} from "react";
import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    Image,
    TouchableNativeFeedback,
    StatusBar,
    ToastAndroid,
    NativeModules,
    ActivityIndicator,
    TouchableOpacity,
    TextInput,
    DeviceEventEmitter,
    PermissionsAndroid
} from "react-native";
import {connect} from "react-redux";
import base from "../styles/base";
import {XIonic} from "../component/XIcon";
import Button from "react-native-button";
import {NavigationActions} from "react-navigation";
import ModalDropdown from "react-native-modal-dropdown";
import Modal from "react-native-modal";
import {setting} from "../script/setting";
const WifiCommand = NativeModules.WifiCommand;
const BLECommand = NativeModules.BLECommand;

const resetAction = NavigationActions.reset({
    index: 0,
    actions: [
        NavigationActions.navigate({routeName: 'Device'})
    ]
})

class addDevice extends Component {
    constructor(props) {
        super(props)
        this.state = {
            wifi: "",
            password: "",
            capabilities: "",
            scanWifi: true,
            scanBLE: true,
            empty: true,
            options: [],
            step: 1,
            lstBLE: [],
            wifis: []
        }
    }

    getPermissions() {
        const {Toast} = this.props.state.language;
        const _self = this;
        //检查权限
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
            if (!result) {
                PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION]).then(function (result) {
                    if (result["android.permission.ACCESS_FINE_LOCATION"] == "granted") {
                        _self.getWifiList();
                    } else {
                        ToastAndroid.show(Toast.positionError, ToastAndroid.SHORT);
                    }
                }, function (err) {
                    console.log(err)
                })
            } else {
                _self.getWifiList();
            }
        });
    }

    getWifiList = () => {
        WifiCommand.getWifiList((result) => {
            result = JSON.parse(result);
            result && result.forEach(ssid => {
                this.state.options.push(ssid.SSID);
            });
            this.setState({scanWifi: false, wifis: result});
        }, (err) => {
            //console.log(err);
        })
    }

    componentWillMount() {
        this.getPermissions();
        //監聽設備事件
        this.subscription = DeviceEventEmitter.addListener("foundBLE", (data) => {
            // handle event.
            try {
                let lstBLE = this.state.lstBLE;
                const ble = JSON.parse(data.data);
                let exist = false;
                //查找当前是否存在
                lstBLE.forEach((o) => {
                    if (ble.address == o.address) {
                        exist = true;
                        return;
                    }
                })
                if (!exist) {
                    lstBLE.push(ble);
                    this.setState({lstBLE: lstBLE});
                }
            } catch (e) {
            }
        })
        this.subscription = DeviceEventEmitter.addListener("foundBLESuccess", (data) => {
            // handle event.
            try {
                const {Toast} = this.props.state.language;
                this.setState({scanBLE: false});
                //ToastAndroid.show(Toast.bleListSuccess, ToastAndroid.SHORT);
            } catch (e) {
            }
        })
    }

    componentWillUnmount() {
        this.subscription.remove();
    }

    getBLEList = () => {
        BLECommand.stopScan();
        this.setState({scanBLE: true});
        BLECommand.getBLEList(err => {
            ToastAndroid.show(this.toastFont.notSupport, ToastAndroid.SHORT);
        });
    }

    toastFont = this.props.state.language.Toast;
    check = () => {
        if (this.state.wifi && this.state.password && this.state.password.length >= 8)
            this.setState({empty: false});
        else
            this.setState({empty: true});
    }

    next = () => {
        if (this.state.step == 1) {
            this.getBLEList();
            this.setState({step: 2});
        } else if (this.state.step == 2) {

        } else if (this.state.step == 3) {

        }
    }

    connectBLE = (address) => {
        ToastAndroid.show(this.toastFont.blueMatching, ToastAndroid.SHORT);
        BLECommand.connectBLE(address, this.state.wifi, this.state.password, this.state.capabilities, (result) => {
            if (result) {
                ToastAndroid.show(this.toastFont.blueMatchingSuccess, ToastAndroid.SHORT);
            } else {
                ToastAndroid.show(this.toastFont.blueMatchingFailed, ToastAndroid.SHORT);
            }
        });
    }

    goBack = () => {
        if (this.state.step == 1) {
            this.props.navigation.goBack();
        } else if (this.state.step == 2) {
            BLECommand.stopScan();
            this.setState({scanBLE: true, step: 1});
        }
    }

    selectWiFi = (index, text) => {
        //保存
        let capabilities = this.state.wifis[index] ? this.state.wifis[index].capabilities : "";
        this.setState({wifi: text, capabilities: capabilities}, this.check);
    }

    render() {
        //const {params} = this.props.navigation.state;
        const addDeviceFont = this.props.state.language.Page.addDevice;
        const inputProp = {
            autoFocus: true,
            autoCorrect: false,
            placeholderTextColor: "#fff",
            underlineColorAndroid: "transparent",
            maxLength: 50
        }
        let lstBLE = [];
        this.state.lstBLE && this.state.lstBLE.forEach((ble, index) => {
            lstBLE.push(<TouchableOpacity key={`ble${index}`}
                                          onPress={()=>{this.connectBLE(ble.address)}}><View
                style={styles.itemBLE}>
                <XIonic name="md-bluetooth" color={"#fff"} size={18}/>
                <Text style={styles.textBLE}>&nbsp;{ble.name}</Text><View
                style={[{flex:1,alignItems:"flex-end"}]}><Text style={styles.textBLE}>{ble.address}</Text></View></View></TouchableOpacity>)
        })
        const header = (<View style={[base.header]}>
            <View style={base.leftIcon}>
                <TouchableOpacity
                    onPress={()=>{this.goBack()}}>
                    <View>
                        <XIonic name="ios-arrow-back" color={setting.header.iconColor} size={setting.header.iconSize}/>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={{flex:5,alignItems:"center"}}>
                <Text
                    style={base.headerText}>{this.state.step == 1 ? addDeviceFont.setWiFi : addDeviceFont.setBlue}</Text>
            </View>
            <View style={base.rightIcon}>
                <TouchableOpacity
                    onPress={()=>{this.getBLEList();}}>
                    <View>
                        {!this.state.scanBLE && this.state.step == 2 &&
                        <XIonic name="md-refresh" color={"#fff"} size={setting.header.iconSize}/>}
                    </View>
                </TouchableOpacity>
            </View>
        </View>);
        return (
            <View style={[styles.container,base.loginBgColor]}>
                <View style={{marginTop:this.props.state.marginTop}}>
                    {header}
                </View>
                <View style={styles.content}>
                    <View style={{alignItems:"center"}}>
                        <XIonic name="ios-wifi" color={"#fff"} size={50}/>
                    </View>
                    <View style={{marginTop:20,alignItems:"center"}}>
                        <View style={base.input}>
                            <ModalDropdown style={{height:40,justifyContent:"center"}}
                                           onSelect={this.selectWiFi }
                                           textStyle={{color:"#fff",fontSize:14}}
                                           defaultValue={addDeviceFont.pleaseWiFi}
                                           dropdownStyle={{width:width-45,top:20,borderWidth:0,borderRadius:0}}
                                           options={this.state.options}/>
                        </View>
                        <View style={base.input}>
                            <TextInput
                                style={base.inputText} placeholder={addDeviceFont.inputPassword} {...inputProp}
                                autoFocus={false}
                                onChangeText={(text) => this.setState({password:text},this.check)}
                                value={this.state.password}
                            />
                        </View>
                    </View>
                    <View style={styles.itemView}>
                        <ActivityIndicator color={"#fff"} animating={true}
                                           style={{ opacity : this.state.scanWifi ? 1 : 0 }}
                                           size='large'></ActivityIndicator>
                        <Button
                            style={[base.btnFont]}
                            containerStyle={[base.btnContainer,this.state.empty&&base.btnDisabled]}
                            onPress={() => this.next()}
                            styleDisabled={base.fontDisabled}
                            disabled={this.state.empty}>
                            {addDeviceFont.next}
                        </Button>
                    </View>
                </View>
                <Modal isVisible={this.state.step==2} style={styles.clear} backdropOpacity={1}
                       onBackButtonPress={()=>this.goBack()}>
                    <View style={[styles.container,base.loginBgColor,base.pt5]}>
                        <View>
                            {header}
                        </View>
                        <View>
                            <ScrollView keyboardShouldPersistTaps={"always"}
                                        style={{paddingLeft:20,paddingRight:20,marginTop:20}}>
                                {lstBLE}
                            </ScrollView>
                            <View style={styles.itemView}>
                                <ActivityIndicator color={"#fff"} animating={true}
                                                   style={{ opacity : this.state.scanBLE ? 1 : 0 }}
                                                   size='large'></ActivityIndicator>
                                <Button
                                    style={[base.btnFont]}
                                    containerStyle={[base.btnContainer,this.state.codeEmpty&&base.btnDisabled]}
                                    onPress={() => this.next()}
                                    styleDisabled={base.fontDisabled}
                                    disabled={this.state.codeEmpty}>
                                    {addDeviceFont.next}
                                </Button>
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
    clear: {
        margin: 0,
        padding: 0
    },
    itemView: {
        paddingTop: 20, alignItems: "center"
    },
    itemBLE: {
        padding: 10,
        backgroundColor: "rgba(0,0,0,.3)",
        borderBottomColor: "#fff",
        borderBottomWidth: .3,
        flexDirection: "row"
    },
    textBLE: {
        color: "#fff"
    }
});

const mapStateToProps = (state) => ({
    state: state.indexReducer
});


export default connect(mapStateToProps)(addDevice);