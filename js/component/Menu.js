const React = require('react');
const {
    Dimensions,
    StyleSheet,
    ScrollView,
    View,
    Image,
    Text,
    TouchableOpacity
} = require('react-native');
const {Component} = React;

const window = Dimensions.get('window');
import {connect} from "react-redux";
import api from "../script/api";
import {language} from "../script/language";
import {setLanguage} from "../action/index";
import {XIcon,XIonic} from "./XIcon";
const uri = 'https://pickaface.net/gallery/avatar/Opi51c74d0125fd4.png';

const styles = StyleSheet.create({
    menu: {
        flex: 1,
        width: window / 3 * 2,
        height: window.height,
        backgroundColor: '#15B4F1',
    },
    avatarContainer: {
        alignItems: "center"
    },
    selectColor: {
        color: "#15B4F1"
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    name: {
        position: 'absolute',
        left: 70,
        top: 20,
    },
    item: {
        paddingTop: 10,
        paddingLeft: 20,
        flexDirection: "row"
    },
    itemFont: {
        fontSize: 18,
        fontWeight: '300',
        color: "#9B9A9A",
        marginLeft: 5
    },
    close: {
        alignItems: "flex-end",
        paddingRight: 5
    },
    closeFont: {
        color: "white",
        fontSize: 25
    }
});

class Menu extends Component {
    static propTypes = {
        onItemSelected: React.PropTypes.func.isRequired,
    };

    changeLanguage = (lanType) => {
        const {dispatch} = this.props;
        //持久化语言
        storage.save({
            key: "language",
            rawData: lanType,
            expires: null
        });
        //设置默认为中文
        dispatch(setLanguage(lanType, language[lanType]));
    }

    render() {
        let menuRender = [];
        this.props.index.language && this.props.index.language.Menu.forEach((menu, index) => {
            menuRender.push((
                <TouchableOpacity onPress={() => this.props.onItemSelected(menu.routeName)} key={`index_${index}`}>
                    <View style={styles.item}>
                        <XIcon name={menu.icon} color={"#9B9A9A"} size={26}></XIcon>
                        <Text style={styles.itemFont}>{menu.menuName}</Text>
                    </View>
                </TouchableOpacity>));
        })
        return (
            <View style={styles.menu}>
                <View style={[styles.close,{marginTop:this.props.index.marginTop}]}>
                    <TouchableOpacity onPress={() => this.props.onClose()}>
                        <View>
                            <XIonic name="md-close" size={30} color={"white"}/>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.avatarContainer}>
                    <Image
                        style={styles.avatar}
                        source={{ uri: this.props.user.user? api.user.logo+this.props.user.user.image:uri}}/>
                </View>
                <View style={{alignItems:"center",paddingTop:5,paddingBottom:20}}>
                    <Text style={{color:"white"}}>
                        {this.props.user.user && this.props.user.user.username}
                    </Text>
                </View>
                <View style={{flex:9,backgroundColor:"#fff"}}>
                    {menuRender}
                </View>
                <View
                    style={{flex:1,flexDirection:"row",justifyContent:"space-around",alignItems:"flex-end",backgroundColor:"white",paddingBottom:5}}>
                    <TouchableOpacity onPress={() =>{
                        this.changeLanguage("CN")
                    }}>
                        <View>
                            <Text style={[styles.itemFont,this.props.index.lanType=="CN"&&styles.selectColor]}>中文</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() =>{
                        this.changeLanguage("EN")
                    }}>
                        <View>
                            <Text
                                style={[styles.itemFont,this.props.index.lanType=="EN"&&styles.selectColor]}>English</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    user: state.userReducer,
    index: state.indexReducer
});

export default connect(mapStateToProps)(Menu);