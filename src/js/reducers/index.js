import { combineReducers } from 'redux';
import * as actions from './../actions/';

const initialState = {
  cloud9Path: "",
  projectPath: "",
  configPath: "",
  portNumber: 0,
  nodeVersion: ""
}

const handlers = {
  [actions.UPDATE_SETTINGS]: (state, action) => {
    return Object.assign({}, state, action.payload);
  }
}

const projectSettings = (state = initialState, action, next) => {
  const handler = handlers[ action.type ];
  return !handler ? state : handler(state, action);
}

export default combineReducers({ projectSettings });
