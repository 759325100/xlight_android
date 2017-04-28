/**
 * Created by 75932 on 2017/4/21.
 */
export const lanType = {
    'en': "EN",
    'cn': "CN"
}

export const language = {
    EN: {
        Toast: {
            userExpired: "User token expired",
            userError: "Email and password do not match",
            timeout: "Request timed out,please check the network",
            emailEmpty: "Please enter email",
            passwordEmpty: "Please enter password",
            exitHint: "Press again to exit the application",
            apiError: "Api request error",
            loading: "Loading...",
            positionError: "Get location failed",
            weatherError: "Get weather information failed",
            cancle: "Cancle",
            all: "All"
        },
        Page: {
            Login: {
                inputEmail: "Please input email",
                inputPassword: "Please input password",
                loginBtn: "Sign",
                registerBtn: "Register",
                forgetPassword: "Forget password?"
            },
            Device: {
                temperatureFont: "Feels like",
                humidityFont: "Temperature",
                saveE: "Save money for you this month",
                roomTemperature: "Temperature",
                roomHumidity: "Humidity",
                roomBrightness: "Bright",
                myDevice: "My device",
                scenesFont: "Scenes:"
            },
            Light: {
                selectScenario: "Please select a scene",
                selectRing: "Please select a ring",
                brightnessSetting: "Brightness setting",
                cctSetting: "CCT setting",
                colorSetting: "Color setting",
                select: "Select"
            },
            Scenes: {
                title: "Scenes",
                systemScenes: "System scenes"
            }
        },
        Menu: [
            {
                routeName: "Index",
                menuName: "Home",
                icon: "home"
            },
            {
                routeName: "Login",
                menuName: "Sign",
                icon: "user-circle"
            },
            {
                routeName: "Log",
                menuName: "Logger",
                icon: "bug"
            }
        ]
    },
    CN: {
        Toast: {
            userExpired: "用户凭证过期",
            userError: "邮箱和密码不匹配",
            timeout: "请求超时，请检查网络连接",
            emailEmpty: "请输入电子邮箱",
            passwordEmpty: "请输入密码",
            exitHint: "再按一次退出应用",
            apiError: "接口返回错误",
            loading: "正在加载...",
            positionError: "定位失败",
            weatherError: "获取天气信息失败",
            cancle: "取消",
            all: "全部"
        },
        Page: {
            Login: {
                inputEmail: "请输入邮箱",
                inputPassword: "请输入密码",
                loginBtn: "登录",
                registerBtn: "注册",
                forgetPassword: "忘记密码？"
            },
            Device: {
                temperatureFont: "体感温度",
                humidityFont: "湿度",
                saveE: "本月为您节省电费",
                roomTemperature: "室内温度",
                roomHumidity: "室内湿度",
                roomBrightness: "室内亮度",
                myDevice: "我的设备",
                scenesFont: "场景："
            },
            Light: {
                selectScenario: "请选择场景",
                selectRing: "请选择环灯",
                brightnessSetting: "亮度设定",
                cctSetting: "色温设定",
                colorSetting: "颜色设定",
                select: "选中"
            },
            Scenes: {
                title: "场景",
                systemScenes: "内置场景"
            }
        },
        Menu: [
            {
                routeName: "Index",
                menuName: "主页",
                icon: "home"
            },
            {
                routeName: "Login",
                menuName: "登录",
                icon: "user-circle"
            },
            {
                routeName: "Log",
                menuName: "日志",
                icon: "bug"
            }
        ]
    }
}