/**
 * Created by 75932 on 2017/4/14.
 */
import React, {Component} from "react";
import {StyleSheet, View, StatusBar, Image, ActivityIndicator, ToastAndroid, NativeModules} from "react-native";
import {router, api} from "../script/api";
import {setLanguage} from "../action/index";
import {setUser} from "../action/userAction";
import {language, lanType} from "../script/language";
import {connect} from "react-redux";
import Update from "../script/update";
import SplashScreen from "react-native-splash-screen";
const Controller = NativeModules.Controller;

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true
        }
    }

    componentDidMount() {
        this.hide();
        const {dispatch} = this.props;
        //加载语言选项，默认为中文
        storage.load({key: "language"}).then(ret => {
            dispatch(setLanguage(ret, language[ret]));
            //check版本
            let update = new Update(language[ret].Toast);
            update.checkUpdate();
        }, ex => {
            //设置默认为中文
            dispatch(setLanguage(lanType.cn, language[lanType.cn]));
            //check版本
            let update = new Update(language[lanType.cn].Toast);
            update.checkUpdate();
        })
        // storage.remove({
        //     key: 'userInfo'
        // });
        //获取Storage中的用户信息
        storage.load({key: "userInfo"}).then(ret => {
            const {email, password} = ret;
            //自动登录，获取AccessToken
            api.post(router.user.login, {
                username: email,
                password: password,
            }).then((ret) => {
                if (ret.code == 1) {
                    //初始化设备
                    Controller.Init(email, password);
                    this.setState({isLoading: false});
                    dispatch(setUser(ret.data[0]));
                    //去设备页
                    this.props.navigation.navigate("Device")
                } else {
                    const {Toast} = this.props.state.language;
                    ToastAndroid.show(Toast.userExpired, ToastAndroid.SHORT);
                    this.setState({isLoading: false});
                    this.props.navigation.navigate('Login');
                }
            }).catch((error) => {
                const {Toast} = this.props.state.language;
                //请求异常
                ToastAndroid.show(Toast.timeout, ToastAndroid.SHORT);
            });
        }, ex => {
            //进入登录页
            this.setState({isLoading: false});
            //使用设备ID自动登录（暂无）
            this.props.navigation.navigate('Login');
        });
    }

    hide = () => {
        setTimeout(() => {
            SplashScreen.hide();
        }, 100);
    }

    render() {
        return (
            <Image source={require('../../assets/images/indexBg.jpg')} style={styles.backgroundImage}>
                <View style={{flex:1}}>
                    <StatusBar hidden={true} animated={true}/>
                </View>
                <View style={styles.loading}>
                    <ActivityIndicator color="white" animating={this.state.isLoading} size='large'/>
                </View>
            </Image>
        )
    }
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: null,
        //不加这句，就是按照屏幕高度自适应
        //加上这几，就是按照屏幕自适应
        //resizeMode:Image.resizeMode.contain,
        //祛除内部元素的白色背景
        backgroundColor: 'rgba(0,0,0,0)',
    },
    loading: {
        flex: 1,
        justifyContent: 'center'
    }
});

const mapStateToProps = (state) => ({
    state: state.indexReducer
});

export default connect(mapStateToProps)(Index);

