/**
 * Created by 75932 on 2017/5/10.
 */
import React, {Component} from "react";
import {AppRegistry, StyleSheet, Platform, Text, View, Alert, TouchableOpacity, Linking} from "react-native";
import {isFirstTime, downloadUpdate, checkUpdate,switchVersion, switchVersionLater, markSuccess} from "react-native-update";
import _updateConfig from "../../update.json";
const {appKey} = _updateConfig[Platform.OS];

export default class update {
    constructor(language) {
        if (isFirstTime)
            markSuccess();
        this.language = language;
    }

    doUpdate = info => {
        downloadUpdate(info).then(hash => {
            if (info.silent) {
                switchVersionLater(hash);
                return;
            }
            Alert.alert(this.language.message, this.language.downloadComplete, [
                {
                    text: this.language.yes, onPress: () => {
                    switchVersion(hash);
                }
                },
                {text: this.language.no,},
                {
                    text: this.language.nextStart, onPress: () => {
                    switchVersionLater(hash);
                }
                },
            ]);
        }).catch(err => {
            Alert.alert(this.language.message, this.language.updateFailed);
        });
    };
    checkUpdate = () => {
        checkUpdate(appKey).then(info => {
            if (info.expired) {
                Alert.alert(this.language.message, this.language.haveUpdate, [
                    {
                        text: this.language.confirm, onPress: () => {
                        info.downloadUrl && Linking.openURL(info.downloadUrl)
                    }
                    },
                ]);
            } else if (info.upToDate) {
                //Alert.alert('提示', '您的应用版本已是最新.');
            } else {
                if (info.metaInfo) {
                    const data = JSON.parse(info.metaInfo);
                    //启用静默更新方式，并再下次重启生效
                    if (data.silent) {
                        info.silent = data.silent;
                        this.doUpdate(info);
                        return;
                    }
                }
                Alert.alert(this.language.message, this.language.haveUpdate, [
                    {
                        text: this.language.confirm, onPress: () => {
                        this.doUpdate(info)
                    }
                    }
                ]);
            }
        }).catch(err => {
            Alert.alert(this.language.message, this.language.updateFailed);
        });
    };
}