import React from 'react';

import { Text } from '../-/Rn';
import intl from '../intl/intl';
import Layout from '../shared/Layout';

const renderParkingCall = c => (
  <Layout compact onBack={c.closeParking} title={intl`Parking`}>
    <Text center small>
      TODO: IN REFACTORING
    </Text>
  </Layout>
);

export default renderParkingCall;
