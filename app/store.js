import { persistReducer, persistStore } from 'redux-persist';
import { routerMiddleware } from 'react-router-redux';
import storage from 'redux-persist/lib/storage';
import { createHashHistory, createMemoryHistory } from 'history';
import { Platform } from 'react-native';
import { combineModels } from '@thenewvu/redux-model/dist';
import * as models from './models';
import { createStore, applyMiddleware, compose } from 'redux';

const persistedReducers = ['profiles', 'recentCalls'];
const persistConfig = {
  key: 'brekeke-phone',
  storage,
  whitelist: persistedReducers,
  version: '3.0.0',
};
const reduce = combineModels(models);

const storeReducer = persistReducer(persistConfig, reduce);

const routerHistory =
  Platform.OS === 'web' ? createHashHistory() : createMemoryHistory();
const router = routerMiddleware(routerHistory);
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export const storeEnhancer = composeEnhancers(applyMiddleware(router));

export const store = createStore(storeReducer, storeEnhancer);
export const storePersistor = persistStore(store);
