import React from 'react';

import AppHeader from '../shared/AppHeader';

const Header = p => (
  <AppHeader
    text="Servers"
    subText={`${p.profileIds.length} IN TOTAL`}
    onCreateBtnPress={p.create}
  />
);

export default Header;
