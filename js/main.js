/**
 * Created by 75932 on 2017/4/14.
 */
import React, {PropTypes} from "react";
import {connect} from "react-redux";
import {AsyncStorage, DrawerLayoutAndroid, NativeModules} from "react-native";
import Storage from "react-native-storage";
import {StackNavigator} from "react-navigation";
import Index from "./page/index";
import Login from "./page/login";
import Device from "./page/device";
import Light from "./page/light";
import Scenes from "./page/scenes";
import {setCurrentRouter, setSliderMenu, setMarginTop} from "./action/index";
import Menu from "./component/Menu";
const Command = NativeModules.Command;

export const AppNavigator = StackNavigator({
    Index: {
        screen: Index,
        navigationOptions: {
            header: {
                visible: false
            }
        }
    },
    Login: {
        screen: Login,
        navigationOptions: {
            header: {
                visible: false
            }
        }
    },
    Device: {
        screen: Device,
        navigationOptions: {
            header: {
                visible: false
            }
        }
    },
    Light: {
        screen: Light,
        navigationOptions: {
            header: {
                visible: false
            }
        }
    },
    Scenes: {
        screen: Scenes,
        navigationOptions: {
            header: {
                visible: false
            }
        }
    }
}, {
    initialRouteName: 'Index',
});

class AppWithNavigationState extends React.Component {
    getCurrentRouteName(navigationState) {
        if (!navigationState) {
            return null;
        }
        const route = navigationState.routes[navigationState.index];
        // dive into nested navigators
        if (route.routes) {
            return this.getCurrentRouteName(route);
        }
        return route.routeName;
    }

    constructor(props) {
        super(props);
        this.state = {
            drawer: null
        }
        Command.getApiLevel((support) => {
            if (support)
                this.props.dispatch(setMarginTop(28))
            else
                this.props.dispatch(setMarginTop(5))
        })
    }

    render() {
        const {dispatch} = this.props;
        const menu = (<Menu navigator={navigator}
                            onClose={()=>this.props.nav.drawer&&this.props.nav.drawer.closeDrawer()}
                            onItemSelected={(item)=> {}}/>);
        const Dimensions = require('Dimensions');
        const {width, height} = Dimensions.get('window');
        return (
            <DrawerLayoutAndroid
                drawerWidth={width*0.6}
                drawerPosition={DrawerLayoutAndroid.positions.Left}
                drawerLockMode={this.props.nav.drawerMode}
                keyboardDismissMode={"on-drag"}
                ref={(drawer) => { !this.props.nav.drawer ?dispatch(setSliderMenu(drawer)) : null}}
                renderNavigationView={() => menu}>
                <AppNavigator onNavigationStateChange={(prevState, currentState) => {
                    setTimeout(()=>{
                       const currentScreen = this.getCurrentRouteName(currentState);
                       dispatch(setCurrentRouter(currentScreen));
                        //每次导航，关闭Drawer
                       this.props.nav.drawer&& this.props.nav.drawer.closeDrawer();
                    },1);
            }}/>
            </DrawerLayoutAndroid>
        )
    }
}

const mapStateToProps = (state) => ({
    nav: state.indexReducer
});


//初始化
var storage = new Storage({
    // 最大容量，默认值1000条数据循环存储
    size: 1000,

    // 存储引擎：对于RN使用AsyncStorage，对于web使用window.localStorage
    // 如果不指定则数据只会保存在内存中，重启后即丢失
    storageBackend: AsyncStorage,

    // 数据过期时间，默认一整天（1000 * 3600 * 24 毫秒），设为null则永不过期
    defaultExpires: null,

    // 读写时在内存中缓存数据。默认启用。
    enableCache: true,

    // 如果storage中没有相应数据，或数据已过期，
    // 则会调用相应的sync方法，无缝返回最新数据。
    // sync方法的具体说明会在后文提到
    // 你可以在构造函数这里就写好sync的方法
    // 或是写到另一个文件里，这里require引入
    // 或是在任何时候，直接对storage.sync进行赋值修改
    //sync: require('./sync')
});

global.storage = storage;

export default connect(mapStateToProps)(AppWithNavigationState);
