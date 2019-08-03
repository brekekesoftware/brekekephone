import './-polyfill';

import { StyleProvider } from 'native-base';
import React from 'react';
import { Provider as StoreProvider } from 'react-redux';
import { Router } from 'react-router';
import { createStore } from 'redux';
import { combineModels, ModelProvider } from 'redux-model';
import { persistReducer, persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import storage from 'redux-persist/lib/storage';

import APIProvider from './apis';
import { history } from './mobx/routerStore';
import * as models from './models';
import nativeBaseStyle from './nativeBaseStyle';
import Routes from './Routes';

const { getter, action, reduce } = combineModels(models);

const persistedReducers = ['profiles', 'recentCalls'];
const persistConfig = {
  key: 'brekeke-phone',
  storage,
  whitelist: persistedReducers,
  version: '3.0.0',
};
const storeReducer = persistReducer(persistConfig, reduce);
const store = createStore(storeReducer);
const storePersistor = persistStore(store);

const App = () => (
  <StoreProvider store={store}>
    <PersistGate persistor={storePersistor}>
      <ModelProvider getter={getter} action={action}>
        <APIProvider>
          <StyleProvider style={nativeBaseStyle}>
            <Router history={history}>
              <Routes />
            </Router>
          </StyleProvider>
        </APIProvider>
      </ModelProvider>
    </PersistGate>
  </StoreProvider>
);

export { store };
export default App;
