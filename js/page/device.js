/**
 * Created by 75932 on 2017/4/18.
 */
import React, {Component} from "react";
import {
    StyleSheet,
    View,
    Text,
    StatusBar,
    TouchableOpacity,
    ToastAndroid,
    Image,
    ScrollView,
    BackAndroid,
    NativeModules,
    PermissionsAndroid,
    ActivityIndicator,
    PixelRatio,
    DeviceEventEmitter
} from "react-native";
import {connect} from "react-redux";
import {PullView} from "react-native-pull";
import {XIcon, XIonic} from "../component/XIcon";
import {api, router} from "../script/api";
import {setPosition} from "../action/index";
import Switch from "react-native-switch-pro";
import {setting} from "../script/setting";
import {weatherIcon} from "../script/weather";
import ActionSheet from "react-native-actionsheet";
const Controller = NativeModules.Controller;
const Command = NativeModules.Command;
class Device extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoding: false,
            location: "N/A",
            outIcon: "code999",
            outTemperature: "N/A",
            outBodyTemperature: "N/A",
            outHumidity: "N/A",
            outRange: "N/A",
            DHTt: "N/A",
            DHTh: "N/A",
            ALS: "N/A",
            PM25: "N/A",
            menu: true,
            random: 1,
            permission: [PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE]
        };
        BackAndroid.addEventListener('hardwareBackPress', this.onBackHandler);
        this.addDevice = this.addDevice.bind(this)
    }

    lastBackPressed = null;
    onBackHandler = () => {
        //判断当前页面
        const {routeName} = this.props.indexReducer;
        if (routeName != "Device")
            return false;
        if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
            //最近2秒内按过back键，可以退出应用。
            BackAndroid.exitApp();
            return true;
        }
        this.lastBackPressed = Date.now();
        const {Toast} = this.props.indexReducer.language;
        ToastAndroid.show(Toast.exitHint, ToastAndroid.SHORT);
        return true;
    };

    componentWillMount() {
        this.getPermissions();
        // //获取该用户下的所有设备
        this.setState({isLoding: true});
        this.loadDevice().then(ret => {
            if (ret.code == 1) {
                this.filterDevice(ret.data.rows);
                this.setState({isLoding: false});
            } else {
                ToastAndroid.show(Toast.apiError, ToastAndroid.SHORT);
                this.setState({isLoding: false});
            }
        }).catch(err => {
            console.log(err)
            ToastAndroid.show(Toast.timeout, ToastAndroid.SHORT);
            this.setState({isLoding: false});
        })
        const {Toast} = this.props.indexReducer.language;
        //设置可拖拽的left
        //this.props.dispatch(setSliderMode("unlocked"));
        //監聽數據事件
        DeviceEventEmitter.addListener("updateSensor", (data) => {
            // handle event.
            try {
                const sensor = JSON.parse(data.data);
                if (sensor.nd && sensor.nd == 130)
                //進行數據更新
                    this.setState({...sensor});
            } catch (e) {
            }
        });
        DeviceEventEmitter.addListener("updateDevice", (data) => {
            // handle event.
            try {
                const device = JSON.parse(data.data);
                this.updateDevice(device);
            } catch (e) {
            }
        })
    }

    getSensor(deviceId) {
        var accessToken = this.props.userReducer.user.access_token;
        const {Toast} = this.props.indexReducer.language;
        api.get(router.sensor.newSensor, {access_token: accessToken, deviceid: deviceId}).then(ret => {
            if (ret.code == 1)
                this.setState({...ret.data[0]});
        }).catch(e => {
            ToastAndroid.show(Toast.timeout, ToastAndroid.SHORT);
        });
    }

    getPermissions() {
        const {Toast} = this.props.indexReducer.language;
        const _self = this;
        //检查权限
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
            if (!result) {
                PermissionsAndroid.requestMultiple(this.state.permission).then(function (result) {
                    if (result["android.permission.ACCESS_FINE_LOCATION"] == "granted") {
                        _self.getPosition();
                    } else {
                        ToastAndroid.show(Toast.positionError, ToastAndroid.SHORT);
                    }
                })
            }
            _self.getPosition();
        });
    }

    getPosition() {
        const {Toast} = this.props.indexReducer.language;
        //获取经纬度
        if (this.props.indexReducer.position) {
            this.loadOutWeather();
        } else {
            Command.GetLocation((result, long, lat) => {
                this.props.dispatch(setPosition({long: long, lat: lat}));
                this.loadOutWeather();
            }, (result, errCode, errMsg) => {
                ToastAndroid.show(Toast.positionError, ToastAndroid.SHORT);
            });
        }
    }

    loadOutWeather = () => {
        if (this.props.indexReducer.position) {
            const {Toast} = this.props.indexReducer.language;
            const city = this.props.indexReducer.position.long + "," + this.props.indexReducer.position.lat;
            const lang = this.props.indexReducer.lanType;
            //调用接口
            api.get(router.weather.weather, {
                city: city,
                lang: lang
            }).then(ret => {
                if (ret.HeWeather5 && ret.HeWeather5.length) {
                    ret = ret.HeWeather5[0];
                    const info = {
                        location: ret.basic.city,
                        outIcon: "code" + ret.now.cond.code,
                        outTemperature: ret.now.tmp,
                        outBodyTemperature: ret.now.fl,
                        outHumidity: ret.now.hum,
                        outRange: ret.daily_forecast[0].tmp.min + "-" + ret.daily_forecast[0].tmp.max,
                    }
                    this.setState({...info});
                }
            }).catch(err => {
                ToastAndroid.show(Toast.weatherError, ToastAndroid.SHORT);
            });
        } else {
            //再次定位
            this.getPosition();
        }
    }

    loadDevice = () => {
        var accessToken = this.props.userReducer.user.access_token;
        return api.get(router.device.devices, {access_token: accessToken, userId: this.props.userReducer.user.id});
    }
    filterDevice = (data) => {
        let devices = [];
        const {dispatch} = this.props;
        let mainDevice = null;
        data.forEach((device) => {
            if (device.maindevice) {
                mainDevice = device.coreid;
                //获取主设备的传感器信息
                this.getSensor(device.coreid);
                //主设备进行区域添加（先写死）
                for (var i = 0; i < 3; i++) {
                    devices.push({
                        id: (255 * i + 1),
                        isMain: 1,
                        coreId: device.coreid,
                        deviceType: 64,
                        deviceNodeType: 1,
                        nodeNo: 255,
                        sid: i,
                        isOn: 0,
                        deviceName: (i == 0 ? "全部" : i == 1 ? "教室灯" : "黑板灯"),
                        scenarioId: 0,
                        deviceRings: [],
                        brightness: 80,
                        cct: 3500
                    })
                }
            }
            device.devicenodes.forEach((node) => {
                devices.push({
                    id: node.id,
                    isMain: device.maindevice,
                    coreId: device.coreid,
                    deviceType: node.devicetype,
                    deviceNodeType: node.devicenodetype,
                    nodeNo: node.nodeno,
                    sid: node.sId,
                    isOn: node.ison,
                    deviceName: node.devicenodename,
                    scenarioId: node.scenarioId,
                    deviceRings: node.devicerings,
                    brightness: node.brightness,
                    cct: node.cct
                });
            });
        });
        //将設備放入redux
        //dispatch(setDevices(this.devices));
        this.setState({devices: devices});
        Controller.InitList(JSON.stringify(devices));
        //mainDevice && Controller.ConnectMain(mainDevice);
    }

    onPullRelease = (resolve) => {
        //do something
        const {Toast} = this.props.indexReducer.language;
        this.loadDevice().then(ret => {
            if (ret.code == 1) {
                this.filterDevice(ret.data.rows);
                resolve();
            } else {
                ToastAndroid.show(Toast.apiError, ToastAndroid.SHORT);
                resolve();
            }
        }).catch(err => {
            ToastAndroid.show(Toast.timeout, ToastAndroid.SHORT);
            resolve();
        })
        this.loadOutWeather();
    }

    topIndicatorRender() {
        return (
            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 60}}>
                <ActivityIndicator size="small" color="gray"/>
            </View>
        );
    }

    updateDevice = (device) => {
        let newDevice = this.state.devices.map(d => {
            let newDevice = {};
            if (d.coreId == device.coreId && device.km && device.hasOwnProperty("on")) {
                //判断继电器
                if (device.km == d.sid) {
                    newDevice.isOn = device.on ? true : false;
                }
                if (d.nodeNo != 255) {
                    newDevice.state = device.State;
                }
            } else if (d.coreId == device.coreId && device.nd == 255) {
                if (device.sid == d.sid) { //同一路的
                    newDevice.isOn = device.State == 1 ? true : false;
                }
                if (d.nodeNo != 255) {
                    newDevice.state = device.State;
                }
            }
            else if (d.coreId == device.coreId && device.nd == d.nodeNo) {
                //進行數據更新
                if (this.isExist(device.BR) && device.BR != d.brightness)
                    newDevice.brightness = device.BR;
                if (this.isExist(device.CCT) && device.CCT != d.cct)
                    newDevice.cct = device.CCT;
                if (this.isExist(device.State) && device.State != d.isOn)
                    newDevice.isOn = device.State == 1 ? true : false;
                if (this.isExist(device.R) && this.isExist(device.G) && this.isExist(device.B) && (device.R != this.getColor(d.color, 0) || device.G != this.getColor(d.color, 1) || device.B != this.getColor(d.color, 2)))
                    newDevice.color = "rgb(" + device.R + "," + device.G + "," + device.B + ")";
                if (this.isExist(device.up)) { //掉线了，将灯变为关闭
                    newDevice.state = device.up;
                    if (device.up == 0)
                        newDevice.isOn = false;
                }
                else
                    newDevice.state = 1;
                d = Object.assign({}, d, newDevice);
            }
            return d;
        });
        this.setState({devices: newDevice});
    }

    isExist = (value) => {
        if (value || value == 0)
            return true;
        else
            return false;
    }

    getColor = (color, i) => {
        //获取主值
        if (color) {
            let newColor = color.substring(4, color.length - 1);
            return newColor.split(',')[i];
        }
        return -1;
    }

    addDevice = (index) => {
        if (index == 1)
            this.props.navigation.navigate("addDevice", {refresh: this.refreshDevice})
    }

    powerSwitch = (device) => {
        let args = {
            cmd: 1,
            node_id: device.nodeNo,
            state: (device.isOn ? 0 : 1)
        };
        if (device.sid)
            args["sid"] = device.sid;
        Controller.JSONCommand(device.coreId, JSON.stringify(args));
        device.isOn = !device.isOn;
        this.setState({random: this.state.random + 1});
    }

    refreshDevice = () => {
    }
// <View style={{position:"absolute",right:0,top:-10}}>
// {device.state == 0 && <XIonic name="ios-warning" color={"gray"} size={23}></XIonic>}
// </View>
    render() {
        const deviceFont = this.props.indexReducer.language.Page.Device;
        const toastFont = this.props.indexReducer.language.Toast;
        const fontColor = "white";
        let deviceRender = [];
        const options = [toastFont.cancel, ...deviceFont.addType];
        this.state.devices && this.state.devices.forEach((device, index) => {
            if (this.state.menu) {
                deviceRender.push(
                    <TouchableOpacity key={`device_${index}`}
                                      style={[styles.deviceMenuItem,!device.isOn &&{backgroundColor:"#efefef"}]}
                                      onPress={()=>{this.powerSwitch(device);}}
                                      onLongPress={()=>{this.props.navigation.navigate("Light",{device:device,updateDevice:this.updateDevice});}}>
                        <View style={{alignItems:"center"}}>
                            <XIonic name="ios-bulb" color={device.isOn?"#ffff00":"#fff"} size={50}></XIonic>
                            <Text>{device.deviceName.substr(0, device.deviceName > 7 ? 7 : device.deviceName.length)}{device.deviceName.length > 7 && "..."}</Text>
                        </View>
                    </TouchableOpacity>);
            }
            else {
                deviceRender.push(
                    <TouchableOpacity key={`device_${index}`} style={styles.deviceItem} onPress={()=>{
                    this.props.navigation.navigate("Light",{device:device,updateDevice:this.updateDevice});
                }}>
                        <View style={[styles.pd10]}>
                            <Image source={require("../../assets/images/blue_logo.png")}
                                   style={styles.deviceIcon} resizeMode="cover"></Image>
                        </View>
                        <View style={{flex:4,justifyContent:"center"}}>
                            <View style={{flexDirection:"row"}}><XIonic name="md-bulb" size={18}
                                                                        color={device.state?"green":"#e3e3e3"}/><Text>&nbsp;{device.deviceName}</Text></View>
                            <View style={{flexDirection:"row"}}>
                                <Text>{deviceFont.scenesFont}</Text>
                                <Text>{device.scenarioId ? device.scenarioId : "N/A"}</Text>
                            </View>
                        </View>
                        <View style={styles.deviceSwitch}>
                            <Switch onSyncPress={(value) => {
                                this.powerSwitch(device);
                        }} value={device.isOn?true:false} width={60} height={35}/>
                        </View>
                    </TouchableOpacity>);
            }
        });
        return (
            <View style={styles.container}>
                <StatusBar hidden={false} translucent={true} animated={true}></StatusBar>
                <View style={{height:260}}>

                    <PullView onPullRelease={this.onPullRelease}
                              topIndicatorRender={this.topIndicatorRender}
                              topIndicatorHeight={60}>
                        <Image source={require("../../assets/images/sky.jpg")} style={styles.image}>
                            <View style={[styles.header,{marginTop:this.props.indexReducer.marginTop}]}>
                                <View style={styles.leftIcon}>
                                    <TouchableOpacity
                                        onPress={()=>{this.props.indexReducer.drawer.openDrawer()}}>
                                        <View>
                                            <XIonic name="ios-menu" color={setting.header.iconColor}
                                                    size={setting.header.iconSize}/>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={{flex:5,alignItems:"center"}}>
                                    <Text style={styles.headerText}>{this.state.location}</Text>
                                </View>
                                <View style={styles.rightIcon}>
                                    <TouchableOpacity
                                        onPress={()=>{this.ActionSheet.show()}}>
                                        <View>
                                            <XIonic name="md-add" color={setting.header.iconColor}
                                                    size={setting.header.iconSize}/>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.headerContent}>
                                <View style={{flex:1}}>
                                    <Text></Text>
                                </View>
                                <View style={{flex:1.5,justifyContent:"center",alignItems:"center"}}>
                                    <Text style={styles.mainTp}>
                                        {this.state.outTemperature}<Text style={{fontSize:25}}>℃</Text>
                                    </Text>
                                </View>
                                <View style={styles.tpRange}>
                                    <Image source={weatherIcon[this.state.outIcon]}
                                           style={styles.weatherIcon}></Image>
                                    <Text style={[styles.white,styles.defaultSize]}>
                                        {this.state.outRange}<Text>℃</Text>
                                    </Text>
                                </View>
                            </View>
                            <View style={{flex:2,flexDirection:"row"}}>
                                <View style={{flex:1,justifyContent:"center"}}>
                                    <View style={{flexDirection:"row",paddingLeft:10}}>
                                        <XIcon name="thermometer-3" color={fontColor} size={25}/>
                                        <Text
                                            style={[styles.ml5,styles.white,styles.defaultSize]}>{deviceFont.temperatureFont}</Text>
                                        <Text
                                            style={[styles.ml5,styles.white,styles.defaultSize]}>{this.state.outBodyTemperature}<Text>℃</Text></Text>
                                    </View>
                                    <View style={[{flexDirection:"row",paddingLeft:10},styles.mt5]}>
                                        <XIcon name="tint" color={fontColor} size={25}/>
                                        <Text
                                            style={[styles.ml5,styles.white,styles.defaultSize]}>{deviceFont.humidityFont}</Text>
                                        <Text
                                            style={[styles.ml5,styles.white,styles.defaultSize]}>{this.state.outHumidity}<Text>%</Text></Text>
                                    </View>
                                </View>
                                <View style={{flex:1}}>
                                    <View style={{flex:1,flexDirection:"row"}}>
                                        <View>
                                            <XIcon name="pagelines" color={fontColor} size={35}/>
                                        </View>
                                        <View style={{justifyContent:"center",paddingLeft:10}}>
                                            <Text style={[styles.white,{fontSize:25}]}>￥<Text
                                                style={{fontSize:25}}>10</Text></Text>
                                        </View>
                                    </View>
                                    <View style={{flex:1}}>
                                        <Text style={[styles.white,styles.defaultSize]}>
                                            {deviceFont.saveE}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </Image>
                    </PullView>
                </View>
                <View style={styles.senView}>
                    {senItem(deviceFont.roomTemperature, this.state.DHTt, "℃", "thermometer-3")}
                    {senItem(deviceFont.roomHumidity, this.state.DHTh, "%", "tint")}
                    {senItem(deviceFont.roomPM25, this.state.PM25, "μg/m³", "md-bulb")}
                </View>
                <View style={{flex:1}}>
                    <View style={[styles.pd10,{flexDirection:"row",alignItems:"center"}]}>
                        <View style={{flex:1}}>
                            <Text>
                                {deviceFont.myDevice}
                            </Text>
                        </View>
                        <View style={{flex:1,  alignItems:"flex-end"}}>
                            <TouchableOpacity onPress={()=>{this.setState({menu:!this.state.menu})}}>
                                <View>
                                    { this.state.menu ? <XIonic name="ios-apps" color={"#4A8BFC"} size={28}/> :
                                        <XIonic name="ios-list" color={"#4A8BFC"} size={36}/>}
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <ScrollView style={{flex:1}} keyboardShouldPersistTaps={"always"}>
                        {this.state.menu ? <View
                                style={{flexDirection:"row",flex:1, justifyContent:"space-between", paddingLeft:5,paddingRight:10,flexWrap:"wrap",flexGrow:1}}>{deviceRender}</View> : deviceRender}
                        <View><ActivityIndicator color={"white"} animating={this.state.isLoding} size='large'/></View>
                    </ScrollView>
                </View>
                <View>
                    <ActionSheet
                        ref={actionSheet => this.ActionSheet = actionSheet}
                        title={deviceFont.addDevice}
                        options={options}
                        cancelButtonIndex={0}
                        onPress={this.addDevice}
                    />
                </View>
            </View>
        );
    }
}

const senItem = (desc, value, unit, icon) => (
    <View style={styles.senItem}>
        <View><Text>{desc}</Text></View>
        <View style={[{flexDirection:"row"},styles.mt10]}>
            <Text style={[styles.ml5,styles.senValue,{marginTop:-5}]}>{value}<Text>{unit}</Text></Text>
        </View>
    </View>
);

const Dimensions = require('Dimensions');
const {width, height} = Dimensions.get('window');
const fontColor = "white"

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    defaultSize: {
        fontSize: 18
    },
    weatherIcon: {
        width: 55,
        height: 55
    },
    deviceIcon: {
        width: 100,
        height: 50
    },
    deviceSwitch: {
        flex: 2, justifyContent: "center", alignItems: "flex-end", marginRight: 10
    },
    deviceItem: {
        flexDirection: "row", backgroundColor: fontColor, borderBottomWidth: 1, borderBottomColor: "#e0e0e0"
    },
    deviceMenuItem: {
        backgroundColor: fontColor,
        padding: 10,
        justifyContent: "center",
        marginTop: 5,
        width: 95,
        borderRadius: 10
    },
    senView: {
        flexDirection: "row", justifyContent: "space-between", backgroundColor: fontColor
    },
    senItem: {
        flex: 1,
        padding: 10,
        alignItems: "center",
        borderRightColor: "#e0e0e0",
        borderRightWidth: 0.5
    },
    senValue: {
        fontWeight: "bold",
        fontSize: 18
    },
    pd10: {
        padding: 10
    },
    mt5: {
        marginTop: 5
    },
    ml5: {
        marginLeft: 5
    },
    mt10: {
        marginTop: 10
    },
    tpRange: {
        flex: 1, alignItems: "center", justifyContent: "center", marginBottom: 40
    },
    headerText: {
        color: fontColor,
        fontSize: 17
    },
    mainTp: {
        color: fontColor,
        fontSize: 50,
        fontWeight: "bold",
    },
    leftIcon: {
        flex: 1, paddingLeft: 15
    },
    rightIcon: {
        flex: 1,
        alignItems: "flex-end",
        paddingRight: 15
    },
    image: {
        width: width,
        height: 260
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    white: {
        color: "white"
    },
    headerContent: {
        flex: 3,
        flexDirection: "row",
        justifyContent: "space-between"
    }
});

const mapStateToProps = (state) => ({
    indexReducer: state.indexReducer,
    userReducer: state.userReducer,
    deviceReducer: state.deviceReducer
});

export default connect(mapStateToProps)(Device);
