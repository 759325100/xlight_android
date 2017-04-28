/**
 * Created by 75932 on 2017/4/27.
 */
import React, {Component} from "react";
import {
    StyleSheet,
    View,
    Text,
    StatusBar,
    TouchableNativeFeedback,
    ToastAndroid,
    Image,
    ScrollView,
    NativeModules,
    TouchableOpacity,
    Modal,
    ActivityIndicator
} from "react-native";
import {connect} from "react-redux";
import {XIcon, XIonic} from "../component/XIcon";
import api from "../script/api";

class Scenes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sceneId: 0,
            isLoding: false
        }
    }

    componentWillMount() {
        const {Toast} = this.props.indexReducer.language;
        var accessToken = this.props.userReducer.user.access_token;
        this.setState({isLoding: true});
        //获取场景数据
        fetch(api.scene.scenes + "?access_token=" + accessToken).then(ret => ret.json()).then(ret => {
            if (ret.code == 1) {
                const scenes = ret.data.rows;
                this.setState({scenes: scenes, isLoding: false});
            } else {
                //提示
                ToastAndroid.show(Toast.apiError, ToastAndroid.SHORT);
                this.setState({isLoding: false});
            }
        }).catch(err => {
            ToastAndroid.show(Toast.timeout, ToastAndroid.SHORT);
            this.setState({isLoding: false});
        });
        this.props.navigation.state.params.callback && this.setState({sceneId: this.props.navigation.state.params.sceneId});
    }

    selectScene = (scene) => {
        if (this.props.navigation.state.params.callback) {
            this.setState({sceneId: scene.id});
            this.props.navigation.state.params.callback(scene);
            this.props.navigation.goBack();
        }
    }

    render() {
        const scenesFont = this.props.indexReducer.language.Page.Scenes;
        let systemScenes = [];
        this.state.scenes && this.state.scenes.length > 0 && this.state.scenes.forEach((scene, index) => {
            if (scene.type == 1) {
                systemScenes.push((<TouchableOpacity
                    onPress={()=>this.selectScene(scene)}
                    key={`scene_${index}`}>
                    <View
                        style={[styles.item]}>
                        <View style={{alignItems:"center",paddingLeft:5,paddingRight:5}}>
                            {scene.image ?
                                <Image source={{uri:api.user.logo+scene.image}} style={styles.logo}></Image> :
                                <XIonic name="md-qr-scanner" size={25} color="#333333"/>}
                        </View>
                        <View style={{flex:5}}>
                            <Text style={styles.defaultSize}>{scene.scenarioname}</Text>
                        </View>
                        {
                            this.props.navigation.state.params.callback && this.state.sceneId == scene.id &&
                            <View style={{flex:1,alignItems:"center"}}>
                                <XIonic name="ios-checkmark-circle" size={28} color="#4370E5"/>
                            </View>
                        }
                    </View>
                </TouchableOpacity>));
            }
        })
        return (
            <View style={styles.container}>
                <View style={styles.top}>
                    <View style={[styles.header,{marginTop:this.props.indexReducer.marginTop}]}>
                        <View style={styles.leftIcon}>
                            <TouchableOpacity
                                onPress={()=>{this.props.navigation.goBack()}}>
                                <View>
                                    <XIcon name="angle-left" color={fontColor} size={28}/>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{flex:5,alignItems:"center"}}>
                            <Text style={styles.headerText}>{scenesFont.title}</Text>
                        </View>
                        <View style={{flex:1}}>

                        </View>
                    </View>
                </View>
                <View>
                    <View style={styles.pdSetting}>
                        <Text style={[styles.settingSize,{flex:1}]}>
                            {scenesFont.systemScenes}
                        </Text>
                    </View>
                    {systemScenes}
                </View>
                <View><ActivityIndicator color={"white"} animating={this.state.isLoding} size='large'/></View>
            </View>
        );
    }
}
const fontColor = "white";
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    defaultSize: {
        fontSize: 18,
        color: "#333333"
    },
    noneMt: {
        marginTop: 0
    },
    logo: {
        height: 30,
        width: 30,
        borderRadius: 15
    },
    item: {
        padding: 10,
        backgroundColor: "white",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderBottomWidth: .7,
        borderBottomColor: "#e3e3e3"
    },
    settingSize: {
        fontSize: 16,
        color: "#333333"
    },
    track: {
        height: 2,
        borderRadius: 1,
    },
    fastIcon: {
        width: 20,
        height: 20,
        borderRadius: 10
    },
    thumb: {
        width: 20,
        height: 20,
        borderRadius: 20 / 2,
        backgroundColor: 'white',
        shadowColor: 'black',
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 2,
        shadowOpacity: 0.35,
        borderWidth: .5,
        top: 11
    },
    colorIcon: {
        width: 20,
        height: 20
    },
    pdSetting: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 5,
        paddingTop: 5,
        flexDirection: "row"
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
    headerText: {
        color: fontColor,
        fontSize: 17
    },
    leftIcon: {
        flex: 1, paddingLeft: 15
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 5
    },
    white: {
        color: "white"
    },
    headerContent: {
        flex: 3,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    top: {
        backgroundColor: "#4370E5"
    }
});

const mapStateToProps = (state) => ({
    indexReducer: state.indexReducer,
    userReducer: state.userReducer,
    deviceReducer: state.deviceReducer
});

export default connect(mapStateToProps)(Scenes);

