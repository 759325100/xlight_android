/**
 * Created by 75932 on 2017/4/21.
 */
const host = "http://iot.xlight.io/";
const weather = {
    host: "https://free-api.heweather.com/v5/weather",
    key: "9aef79e309714cd5adf38e6d96cb1634"
}

const router = {
    user: {
        login: host + "users/login",
        logout: host + "users/logout",
        logo: host
    },
    device: {
        devices: host + "devices"
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

export default router;