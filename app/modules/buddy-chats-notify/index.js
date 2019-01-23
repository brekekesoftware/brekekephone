import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createModelView } from '@thenewvu/redux-model';
import UI from './ui';

const mapGetter = getter => (state, props) => ({
  buddy: getter.ucUsers.detailMapById(state)[props.match.params.buddy],
  chatIds: getter.buddyChats.idsMapByBuddy(state)[props.match.params.buddy],
});

class View extends Component {
  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  render = () => <UI />;
}

export default createModelView(mapGetter)(View);
