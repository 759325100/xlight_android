/**
 * Created by 75932 on 2017/4/14.
 */
import Icon from "react-native-vector-icons/FontAwesome";
import Ionic from "react-native-vector-icons/Ionicons";
import React, {Component} from "react";

class XIcon extends Component {
    render() {
        return (
            <Icon name={this.props.name} size={this.props.size || 13} color={this.props.color ||"#fff"}/>
        );
    }
}


class XIconBtn extends Component {
    render() {
        return (
            <Icon.Button name="facebook" backgroundColor="#3b5998" onPress={this.props.onPress}>
                Login with Facebook
            </Icon.Button>
        );
    }
}

class XIonic extends Component{
    render(){
        return(
            <Ionic name={this.props.name} size={this.props.size || 13} color={this.props.color ||"#fff"}/>
        );
    }
}

const IconObj = {
    get XIcon() {
        return XIcon;
    },
    get XIconBtn() {
        return XIconBtn;
    },
    get XIonic(){
        return XIonic;
    }
}

module.exports = IconObj;