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
            emailValid: "Please enter a valid Email",
            exitHint: "Press again to exit the application",
            passwordNoMatch: "The password does not match",
            apiError: "Api request error",
            userExist: "The email has been registered",
            userNotExist: "The email is not registered",
            invalidCode: "Invalid verification code",
            loading: "Loading...",
            positionError: "Get location failed",
            weatherError: "Get weather information failed",
            getWifiError: "Get Wi-Fi list failed",
            cancel: "Cancel",
            bleListSuccess: "The scan is done",
            all: "All",
            message: "Message",
            updateFailed: "Automatic upgrade failed",
            haveUpdate: "Check for a new version, download it",
            downloadComplete: "Upgrade is complete and restart now?",
            yes: "Yes",
            no: "No",
            confirm: "Confirm",
            nextStart: "Next time",
            logging: "Logging in"
        },
        Page: {
            Login: {
                inputEmail: "Email",
                inputPassword: "Password",
                loginBtn: "Sign In",
                registerBtn: "Sign Up",
                forgetPassword: "Forget password?"
            },
            Device: {
                temperatureFont: "Feels like",
                humidityFont: "Temperature",
                saveE: "Save money for you this month",
                roomTemperature: "Temperature",
                roomHumidity: "Humidity",
                roomBrightness: "Bright",
                roomPM25: "PM2.5",
                myDevice: "My device",
                scenesFont: "Scenes:",
                addDevice: "Add device",
                addType: [
                    "Add device by BLE"
                ]
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
            },
            SignUp: {
                next: "Next",
                remark: "By signing up,you agree to the ",
                and: "and ",
                terms: "Terms of Service ",
                policy: "Privacy Policy",
                inputCode: "Verification Code",
                verificationCode: "We've sent you can email to ",
                verificationCodeAfter: " that will help you creating a new password.Check our spam folder if it dosen't appear",
                inputPassword: "Password",
                inputConfirmPassword: "Confirm Password"
            },
            Forget: {
                next: "Next",
                resetHint: "Please enter the email address you signed up with to revcive a password reset email",
                header: "Reset Password",
                verificationCode: "We've sent you can email to ",
                verificationCodeAfter: " that will help you creating a new password.Check our spam folder if it dosen't appear",
                inputPassword: "Password",
                inputCode: "Verification Code",
                inputConfirmPassword: "Confirm Password"
            }
        },
        Menu: [
            {
                routeName: "Device",
                menuName: "Home",
                icon: "home"
            },
            {
                routeName: "Login",
                menuName: "Sign",
                icon: "user-circle"
            },
            // {
            //     routeName: "Log",
            //     menuName: "Logger",
            //     icon: "bug"
            // }
        ]
    },
    CN: {
        Toast: {
            userExpired: "用户凭证过期",
            userError: "邮箱和密码不匹配",
            timeout: "请求超时，请检查网络连接",
            emailValid: "请输入有效的电子邮箱",
            exitHint: "再按一次退出应用",
            passwordNoMatch: "两次输入的密码不一致",
            apiError: "接口返回错误",
            userExist: "邮箱已被注册",
            userNotExist: "邮箱未注册",
            invalidCode: "验证码无效",
            loading: "正在加载...",
            positionError: "定位失败",
            weatherError: "获取天气信息失败",
            cancel: "取消",
            all: "全部",
            message: "提示",
            updateFailed: "自动升级失败",
            haveUpdate: "检查到新的版本，立即下载",
            downloadComplete: "升级完成，立即重启？",
            getWifiError: "获取Wi-Fi列表失败",
            bleListSuccess: "搜索完成",
            yes: "是",
            no: "否",
            confirm: "确定",
            nextStart: "下次启动时",
            logging: "登录中...",
            notSupport: "设备不支持蓝牙",
            blueMatching: "正在配对",
            blueMatchingSuccess: "配对成功",
            blueMatchingFailed: "配对失败",
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
                scenesFont: "场景：",
                addDevice: "添加设备",
                roomPM25: "室内PM2.5",
                addType: [
                    "通过蓝牙添加"
                ]
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
            },
            SignUp: {
                next: "下一步",
                remark: "使用注册即表示您同意",
                and: "和",
                terms: "服务条款",
                policy: "隐私政策",
                inputCode: "验证码",
                verificationCode: "我们已发送您可以发送电子邮件到",
                verificationCodeAfter: "，这将帮助您创建一个新的密码。如果没有出现，请检查我们的垃圾邮件文件夹",
                inputPassword: "新密码",
                inputConfirmPassword: "确认密码"
            },
            Forget: {
                next: "下一步",
                resetHint: "请输入您注册时使用的邮箱",
                header: "重置密码",
                verificationCode: "我们已发送您可以发送电子邮件到",
                verificationCodeAfter: "，这将帮助您创建一个新的密码。如果没有出现，请检查我们的垃圾邮件文件夹",
                inputPassword: "新密码",
                inputCode: "验证码",
                inputConfirmPassword: "确认密码",
            },
            addDevice: {
                setWiFi: "选择设备工作Wi-Fi",
                next: "下一步",
                inputPassword: "请输入密码",
                pleaseWiFi: "请选择Wi-Fi",
                setBlue: "选择要绑定的设备"
            }
        },
        Menu: [
            {
                routeName: "Device",
                menuName: "首页",
                icon: "home"
            },
            {
                routeName: "Login",
                menuName: "登录",
                icon: "user-circle"
            },
            // {
            //     routeName: "Log",
            //     menuName: "日志",
            //     icon: "bug"
            // }
        ]
    }
}