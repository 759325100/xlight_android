/**
 * Created by 75932 on 2017/4/21.
 */
import * as types from "../action/actionType";

export default userReducer = (state = {}, action) => {
    switch (action.type) {
        case types.SET_USER:
            return {...state, user: action.user}
        default:
            return state;
    }
}