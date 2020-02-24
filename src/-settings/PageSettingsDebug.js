import { observer } from 'mobx-react';
import React, { Component } from 'react';

import g from '../global';
import intl from '../intl/intl';
import Field from '../shared/Field';
import Layout from '../shared/Layout';

@observer
class PageSettingsDebug extends Component {
  render() {
    return (
      <Layout
        description={intl`App information and debugging`}
        onBack={g.backToPageProfileSignIn}
        title={intl`Debug`}
      >
        <Field isGroup label={intl`DEBUG`} />
      </Layout>
    );
  }
}

export default PageSettingsDebug;
