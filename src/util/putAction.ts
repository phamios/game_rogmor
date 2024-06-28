import { put } from 'redux-saga/effects';
export const putAction = (type, payload) => put({type, payload});