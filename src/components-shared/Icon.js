import React from 'react';
import { Icon } from 'native-base';


class Icons extends React.Component {
  render() {
    return (
      <Icon name={this.props.name} type="MaterialIcons" />
    );
  }
}

export default Icons;
