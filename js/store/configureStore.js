/**
 * Created by 75932 on 2017/4/19.
 */
import {createStore, applyMiddleware} from "redux";
import thunkMiddleware from "redux-thunk";
import rootReducer from "../reducers/index";
import {createLogger} from "redux-logger";
//, createLogger()
const createStoreWithMiddleware = applyMiddleware()(createStore);
export default function configureStore(initialState) {
    const store = createStoreWithMiddleware(rootReducer, initialState);
    return store;
}