import React from 'react';

import routerStore from '../-/routerStore';
import BrekekeGradient from '../shared/BrekekeGradient';
import Layout from '../shared/Layout';

const Page404 = () => (
  <BrekekeGradient>
    <Layout
      header={{
        transparent: true,
        title: '404',
        description: 'The link visited is not found or invalid',
        onBackBtnPress: () => routerStore.goBack(routerStore.goToProfileSignIn),
      }}
    />
  </BrekekeGradient>
);

export default Page404;
