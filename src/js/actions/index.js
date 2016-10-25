import { createAction } from 'redux-actions';

export const SELECT_C9_PROJECT_DIRECTORY = 'SELECT_C9_PROJECT_DIRECTORY';
export const selectC9ProjectDirectory = createAction(SELECT_C9_PROJECT_DIRECTORY);

export const SELECT_PROJECT_DIRECTORY = 'SELECT_PROJECT_DIRECTORY';
export const selectProjectDirectory = createAction(SELECT_PROJECT_DIRECTORY);

export const OPEN_PROJECT = 'OPEN_PROJECT';
export const openProject = createAction(OPEN_PROJECT);

export const UPDATE_SETTINGS = 'UPDATE_SETTINGS';
export const updateStatus = createAction(UPDATE_SETTINGS);