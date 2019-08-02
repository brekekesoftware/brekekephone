import { StyleProvider } from 'native-base';
import React from 'react';
import { Provider as StoreProvider } from 'react-redux';
import { Router } from 'react-router';
import { createStore } from 'redux';
import { combineModels, ModelProvider } from 'redux-model';
import { persistReducer, persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import storage from 'redux-persist/lib/storage';

import _ from 'lodash';
import getTheme from 'native-base/src/theme/components';
import variables from 'native-base/src/theme/variables/commonColor';
// import getTheme from './native-base-theme/components';
// import variables from './native-base-theme/variables/commonColor';

import './-polyfill';
import Routes from './Routes';
import APIProvider from './apis';
import { history } from './mobx/routerStore';
import * as models from './models';

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

_.merge(variables, {
  platform: 'ios',
  cardItemPadding: 10 ,
  CheckboxRadius: 13 ,
  CheckboxBorderWidth: 1 ,
  CheckboxPaddingLeft: 4 ,
  CheckboxPaddingBottom: 0 ,
  CheckboxIconSize: 21 ,
  CheckboxIconMarginTop: undefined ,
  CheckboxFontSize: 23 / 0.9 ,
  brandPrimary: '#007aff' ,
  fontFamily: 'System' ,
  toolbarBtnColor: '#007aff' ,
  toolbarSearchIconSize: 20 ,
  toolbarBtnTextColor: '#007aff' ,
  toolbarDefaultBorder: '#a7a6ab' ,
  radioBtnSize: 25 ,
  radioBtnLineHeight: 29 ,
  segmentBackgroundColor: '#F8F8F8' ,
  segmentActiveBackgroundColor: '#007aff' ,
  segmentTextColor: '#007aff' ,
  segmentActiveTextColor: '#fff' ,
  segmentBorderColor: '#007aff' ,
  segmentBorderColorMain: '#a7a6ab' ,
  titleFontfamily: 'System' ,
  titleFontSize: 17 ,
  subTitleFontSize: 11 ,
  subtitleColor: '#000' ,
  titleFontColor: '#000' ,
  borderRadiusBase: 5 ,
  get btnTextSize() {
    return this.fontSizeBase * 1.1;
  },
});

const nativeBaseStyle = getTheme(variables);

const recursiveUpdateStyle = obj => {
  Object.entries(obj).forEach(([k, v]) => {
    if (k === 'fontFamily') {
      obj[k] = 'RobotoLight';
    } else if (k === 'borderRadius') {
      obj[k] = 3;
    } else if (v && typeof v === 'object') {
      recursiveUpdateStyle(v);
    }
  });
};

recursiveUpdateStyle(nativeBaseStyle);

// _.merge(nativeBaseStyle, {
//   'NativeBase.Header': {
//     '.noLeft': {
//       'NativeBase.Left': {
//         width: 0,
//         flex: 1,
//       },
//     },
//   },
// });

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
