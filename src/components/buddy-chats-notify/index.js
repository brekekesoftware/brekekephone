import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { createModelView } from 'redux-model';

import UI from './ui';

const mapGetter = getter => (state, props) => {
  const duplicatedMap = {};

  return {
    buddy: getter.ucUsers.detailMapById(state)[props.match.params.buddy],

    chatIds: (
      getter.buddyChats.idsMapByBuddy(state)[props.match.params.buddy] || []
    ).filter(id => {
      if (duplicatedMap[id]) {
        return false;
      }

      duplicatedMap[id] = true;
      return true;
    }),
  };
};

class View extends Component {
  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  render = () => <UI />;
}

export default createModelView(mapGetter)(View);
