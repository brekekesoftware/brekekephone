import React from 'react';

import { Text } from '../-/Rn';
import intl from '../intl/intl';
import Layout from '../shared/Layout';

const renderTransferringCall = c => (
  <Layout compact onBack={c.closeTransferring} title={intl`Transfer Dial`}>
    <Text center small>
      TODO: IN REFACTORING
    </Text>
  </Layout>
);

export default renderTransferringCall;
