import { takeEvery, takeLatest, delay } from 'redux-saga';
import { fork, call, select, put, take } from 'redux-saga/effects';
import * as actions from './../actions';
import { ipcRenderer } from 'electron';
const ipcRendererOn = (channel) => (new Promise((resolve, reject) => ipcRenderer.on(channel, (event, arg) => resolve({event, arg}))));

function* selectC9ProjectDir() {
  while (true) {
    const action = yield take(actions.SELECT_C9_PROJECT_DIRECTORY);
    console.log("select c9 project dir");
    ipcRenderer.send('select-c9'); 
    const { event, arg }  = yield ipcRendererOn('select-c9-done');
    yield put(actions.updateStatus(arg));
  }
}

function* selectProjectDir() {
  while(true) {
    const action = yield take(actions.SELECT_PROJECT_DIRECTORY);
    console.log("select project dir");
    ipcRenderer.send('select-project');
    const { event, arg } = yield ipcRendererOn('select-project-done');
    yield put(actions.updateStatus(arg));
  }
}

function* openProject() {
  while(true) {
    const action = yield take(actions.OPEN_PROJECT);
    console.log("open project");
    ipcRenderer.send('open-project');
  }
}

function* initialize() {
  ipcRenderer.send('initialize');
  const { event, arg } = yield ipcRendererOn('initialize-done');
  yield put(actions.updateStatus(arg));
  while (true) {
    const { event, arg } = yield ipcRendererOn('cloud9-logs');
    console.log(arg);
  }
}

export default function* rootSaga() {
  yield [
    fork(initialize),
    fork(selectC9ProjectDir),
    fork(selectProjectDir),
    fork(openProject)
  ]
}