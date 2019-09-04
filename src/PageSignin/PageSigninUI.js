import React from 'react';

import AppHeader from '../shared/AppHeader';
import LinearGradient from '../shared/LinearGradient';
import v from '../style/variables';
import ListServer from './ListServer';

const PageSiginUI = p => (
  <LinearGradient
    style={{
      flex: '1',
    }}
    colors={[v.brekekeGreen, '#2a2a2a']}
  >
    <AppHeader
      text="Servers"
      subText={`${p.profileIds.length} IN TOTAL`}
      onCreateBtnPress={p.create}
      createBtnGreen={false}
    />
    <ListServer {...p} />
  </LinearGradient>
);

export default PageSiginUI;
