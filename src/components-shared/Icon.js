import { Icon } from 'native-base';
import React from 'react';

class Icons extends React.Component {
  render() {
    return <Icon name={this.props.name} type="MaterialIcons" />;
  }
}

export default Icons;
