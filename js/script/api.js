/**
 * Created by 75932 on 2017/4/21.
 */
const host = "http://123.207.166.211:8080/";//"https://iot.xlight.io/";
const weather = {
    host: "https://free-api.heweather.com/v5/weather",
    key: "e297bafd6451417e97f3bce606fbee13"
}

export const router = {
    user: {
        login: host + "users/login",
        logout: host + "users/logout",
        signUp: host + "users",
        exist: host + "users/checkemail",
        validCode: host + "users/checkcode",
        logo: host,
        sendValidCode: host + "users/sendverificationcode",
        resetPassword: host + "users/updatepassword"
    },
    device: {
        devices: host + "devices"
    },
    sensor: {
        newSensor: host + "sensorsdatas/newdatalist"
    },
    deviceNode: {
        changeScenario: host + "devicenodes/",
        deviceNode: host + "devicenodes/"
    },
    weather: {
        weather: weather.host + "?key=" + weather.key, // https://free-api.heweather.com/v5/now?city=65.9667,15.0444&key=9aef79e309714cd5adf38e6d96cb1634&lang=CN
    },
    scene: {
        scenes: host + "scenarios"
    },
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
}

export const api = {
    get: (url, params, extend) => {
        //得到参数
        let urlParams = "";
        for (let key in params) {
            urlParams += (key + "=" + params[key] + "&");
        }
        //去除末尾的&
        urlParams = urlParams.lastIndexOf("&", urlParams.length - 1) > 0 ? urlParams.substr(0, urlParams.length - 1) : urlParams;
        if (!extend)
            extend = {method: "GET"}
        url += ( url.indexOf("?") > -1 ? "&" + urlParams : "?" + urlParams);
        return fetch(url, extend).then(ret => ret.json());
    },
    post: (url, params, method) => {
        let token = {};
        if (params.access_token) {
            token.access_token = params.access_token;
            delete  params.access_token;
        }
        //处理params
        return api.get(url, token, {
            method: method || "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(params)
        });
    },
    delete: "",
    put: (url, params) => {
        return api.post(url, params, "PUT");
    }
}