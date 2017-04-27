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
    ActivityIndicator,
    PixelRatio
} from "react-native";
import {connect} from "react-redux";
import {PullView} from "react-native-pull";
import {XIcon,XIonic} from "../component/XIcon";
import api from "../script/api";
import {setDevice, setOutWeather} from "../action/deviceAction";
import {setPosition,setSliderMode} from "../action/index";
import Switch from "react-native-switch-pro";
import {weatherIcon} from "../script/weather";
const Controller = NativeModules.Controller;
const Command = NativeModules.Command;
class Device extends Component {
    constructor(props) {
        super(props);
        this.state = {isLoding: false};
        BackAndroid.addEventListener('hardwareBackPress', this.onBackAndroid);
    }

    lastBackPressed = null;
    onBackAndroid = () => {
        //判断当前页面
        const {routeName} = this.props.indexReducer;
        if (routeName != "Device")
            return false;
        if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
            //最近2秒内按过back键，可以退出应用。
            BackAndroid.exitApp();
        }
        this.lastBackPressed = Date.now();
        const {Toast} = this.props.indexReducer.language;
        ToastAndroid.show(Toast.exitHint, ToastAndroid.SHORT);
        return true;
    };

    componentDidMount() {
        this.getPosition();
        //获取该用户下的所有设备
        this.setState({isLoding: true});
        const {Toast} = this.props.indexReducer.language;
        this.loadDevice().then(ret => {
            if (ret.code == 1) {
                this.filterDevice(ret.data.rows);
                this.setState({isLoding: false});
            } else {
                ToastAndroid.show(Toast.apiError, ToastAndroid.SHORT);
                this.setState({isLoding: false});
            }
        }).catch(err => {
            ToastAndroid.show(Toast.timeout, ToastAndroid.SHORT);
            this.setState({isLoding: false});
        })
        //设置可拖拽的left
        this.props.dispatch(setSliderMode("unlocked"));
    }

    getPosition() {
        //获取经纬度
        if (this.props.indexReducer.position) {
            this.loadOutWeather();
        } else {
            Command.GetLocation((result, long, lat) => {
                this.props.dispatch(setPosition({long: long, lat: lat}));
                this.loadOutWeather();
            }, (result, errCode, errMsg) => {
                const {Toast} = this.props.indexReducer.language;
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
            fetch(api.weather.weather + "&city=" + city + "&lang=" + lang).then(ret => ret.json()).then(ret => {
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
                    const {dispatch} = this.props;
                    dispatch(setOutWeather(info));
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
        return fetch(api.device.devices + "?access_token=" + accessToken).then(res => res.json());
    }

    filterDevice = (data) => {
        const {dispatch} = this.props;
        let devices = [];
        data.forEach((device) => {
            device.devicenodes.forEach((node) => {
                devices.push({
                    id: node.id,
                    coreId: device.coreid,
                    deviceType: node.devicetype,
                    deviceNodeType: node.devicenodetype,
                    nodeNo: node.nodeno,
                    isOn: node.ison ? true : false,
                    deviceName: node.devicenodename,
                    scenarioId: node.scenarioId,
                    deviceRings: node.devicerings,
                    brightness: node.brightness,
                    cct: node.cct
                });
            });
        });
        //将输入放入redux
        dispatch(setDevice(devices));
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

    render() {
        const deviceFont = this.props.indexReducer.language.Page.Device;
        const fontColor = "white";
        const deviceList = this.props.deviceReducer.devices;
        const {deviceReducer} = this.props;
        let deviceRender = [];
        deviceList && deviceList.forEach((device, index) => {
            deviceRender.push(
                <TouchableOpacity key={`device_${index}`} style={styles.deviceItem} onPress={()=>{
                    this.props.navigation.navigate("Light",{id:device.id});
                }}>
                    <View style={[styles.pd10,{flex:1.5}]}>
                        <Image source={require("../../assets/images/xlt_160.png")}
                               style={styles.deviceIcon}></Image>
                    </View>
                    <View style={{flex:4,justifyContent:"center"}}>
                        <View><Text>{device.deviceName}</Text></View>
                        <View style={{flexDirection:"row"}}>
                            <Text>{deviceFont.scenesFont}</Text>
                            <Text>{device.scenarioId ? device.scenarioId : "N/A"}</Text>
                        </View>
                    </View>
                    <View style={styles.deviceSwitch}>
                        <Switch onSyncPress={(value) => {
                            Controller.Connect(device.coreId);
                            Controller.JSONCommand(JSON.stringify({cmd:1,node_id:device.nodeNo,state:(value?1:0)}));
                        }} value={device.isOn}/>
                    </View>
                </TouchableOpacity>);
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
                                            <XIonic name="md-list" color={fontColor} size={28}/>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={{flex:5,alignItems:"center"}}>
                                    <Text style={styles.headerText}>{deviceReducer.location}</Text>
                                </View>
                                <View style={styles.rightIcon}>
                                    <XIonic name="md-add" color={fontColor} size={28}/>
                                </View>
                            </View>
                            <View style={styles.headerContent}>
                                <View style={{flex:1}}>
                                    <Text></Text>
                                </View>
                                <View style={{flex:1.5,justifyContent:"center",alignItems:"center"}}>
                                    <Text style={styles.mainTp}>
                                        {deviceReducer.outTemperature}<Text style={{fontSize:25}}>℃</Text>
                                    </Text>
                                </View>
                                <View style={styles.tpRange}>
                                    <Image source={weatherIcon[deviceReducer.outIcon]}
                                           style={styles.weatherIcon}></Image>
                                    <Text style={[styles.white,styles.defaultSize]}>
                                        {deviceReducer.outRange}<Text>℃</Text>
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
                                            style={[styles.ml5,styles.white,styles.defaultSize]}>{deviceReducer.outBodyTemperature}<Text>℃</Text></Text>
                                    </View>
                                    <View style={[{flexDirection:"row",paddingLeft:10},styles.mt5]}>
                                        <XIcon name="tint" color={fontColor} size={25}/>
                                        <Text
                                            style={[styles.ml5,styles.white,styles.defaultSize]}>{deviceFont.humidityFont}</Text>
                                        <Text
                                            style={[styles.ml5,styles.white,styles.defaultSize]}>{deviceReducer.outHumidity}<Text>%</Text></Text>
                                    </View>
                                </View>
                                <View style={{flex:1}}>
                                    <View style={{flex:1,flexDirection:"row"}}>
                                        <View style={{flex:1}}>
                                            <XIcon name="pagelines" color={fontColor} size={35}/>
                                        </View>
                                        <View style={{flex:2,justifyContent:"center"}}>
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
                    {senItem(deviceFont.roomTemperature, deviceReducer.roomTemperature, "℃", "thermometer-3")}
                    {senItem(deviceFont.roomHumidity, deviceReducer.roomHumidity, "%", "tint")}
                    {senItem(deviceFont.roomBrightness, deviceReducer.roomBrightness, "lx", "md-bulb")}
                </View>
                <View style={{flex:1}}>
                    <View style={styles.pd10}>
                        <Text>
                            {deviceFont.myDevice}
                        </Text>
                    </View>
                    <ScrollView style={{flex:1}}>
                        {this.state.isLoding ? (
                                <View><ActivityIndicator color={"white"} animating={this.state.isLoding} size='large'/></View>) :
                            (<View></View>)}
                        {deviceRender}
                    </ScrollView>
                </View>
            </View>
        );
    }
}

const senItem = (desc, value, unit, icon) => (
    <View style={styles.senItem}>
        <View><Text>{desc}</Text></View>
        <View style={[{flexDirection:"row"},styles.mt10]}>
            {icon=="md-bulb"? <XIonic name={icon} color={"#757575"} size={16}/>: <XIcon name={icon} color={"#757575"} size={16}/>}
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
        width: 50,
        height: 50
    },
    deviceSwitch: {
        flex: 2, justifyContent: "center", alignItems: "flex-end", marginRight: 10
    },
    deviceItem: {
        flexDirection: "row", backgroundColor: fontColor, borderBottomWidth: 0.5, borderBottomColor: "#e0e0e0"
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
