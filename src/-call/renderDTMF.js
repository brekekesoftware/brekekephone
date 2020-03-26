import React from 'react';

import { Text } from '../-/Rn';
import intl from '../intl/intl';
import Layout from '../shared/Layout';

const renderDTMF = c => (
  <Layout compact onBack={c.toggleDTMF} title={intl`DTMF`}>
    <Text center small>
      TODO: IN REFACTORING
    </Text>
  </Layout>
);

export default renderDTMF;
