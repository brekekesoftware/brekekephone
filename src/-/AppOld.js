import './oldNativeBaseTheme';

import React from 'react';

import ApiProvider from '../apis';
import Routes from './Routes';

const App = () => (
  <ApiProvider>
    <Routes />
  </ApiProvider>
);

export default App;
