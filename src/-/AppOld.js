import React from 'react';
import { Router } from 'react-router';

import ApiProvider from './apis';
import { setAppOld } from './AppOld_';
import router from './routerStore';
import Routes from './Routes';

const App = () => (
  <Router history={router.history}>
    <ApiProvider>
      <Routes />
    </ApiProvider>
  </Router>
);
setAppOld(App);

export default App;
