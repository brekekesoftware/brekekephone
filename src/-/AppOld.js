import './oldNativeBaseTheme';

import React from 'react';
import { Provider as StoreProvider } from 'react-redux';
import { createStore } from 'redux';
import { combineModels, ModelProvider } from 'redux-model';
import { persistReducer, persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import storage from 'redux-persist/lib/storage';

import * as models from '../-models';
import ApiProvider from '../apis';
import Routes from './Routes';

delete models.__esModule;

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
        <ApiProvider>
          <Routes />
        </ApiProvider>
      </ModelProvider>
    </PersistGate>
  </StoreProvider>
);

export { store };
export default App;
