import React from 'react';

import GradientBackground from '../components-shared/GradientBackground';
import Header from './Header';
import ListServer from './ListServer';

class ServerForm extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Header />
        <ListServer />
      </React.Fragment>
    );
  }
}

export default ServerForm;
