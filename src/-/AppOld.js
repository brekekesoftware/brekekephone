import React from 'react';
import { Router } from 'react-router';

import { setAppOld } from './AppOld_';
import ApiProvider from './components/ApiProvider';
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
