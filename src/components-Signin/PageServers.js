import React from 'react';

import ServerForm from './ServerForm';

class PageServers extends React.Component {
  render() {
    return <ServerForm {...this.props} />;
  }
}

export default PageServers;
