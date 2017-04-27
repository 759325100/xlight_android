/**
 * Created by 75932 on 2017/4/14.
 */
import React, {Component} from "react";
import Drawer from "react-native-drawer";
import {StyleSheet, View, Text, Button} from "react-native";

export default class SideMenu extends Component {
    state = {
        drawerOpen: false,
        drawerDisabled: false,
    };
    closeDrawer = () => {
        this._drawer.close()
    };
    openDrawer = () => {
        this._drawer.open()
    };

    render() {
        return (
            <Drawer
                ref={(ref) => this._drawer = ref}
                type="static"
                content={
                    <View><Button onPress={()=>{}} title={"Close Panel"}></Button></View>
                }
                acceptDoubleTap
                styles={{main: {shadowColor: '#000000', shadowOpacity: 0.3, shadowRadius: 15}}}
                onOpen={() => {
                    this.setState({drawerOpen: true})
                }}
                onClose={() => {
                    this.setState({drawerOpen: false})
                }}
                captureGestures={false}
                tweenDuration={100}
                panThreshold={0.08}
                disabled={this.state.drawerDisabled}
                openDrawerOffset={(viewport) => {
                    return 100
                }}
                closedDrawerOffset={() => 50}
                panOpenMask={0.2}
                negotiatePan
            >
                <View>
                    <Text>Main Area</Text>
                </View>
            </Drawer>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
    }
})