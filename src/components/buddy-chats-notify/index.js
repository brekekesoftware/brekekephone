import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import { createModelView } from 'redux-model';

import UI from './ui';

@observer
@createModelView(
  getter => (state, props) => {
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
  },
  action => emit => ({
    //
  }),
)
@observer
class View extends React.Component {
  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  render = () => <UI />;
}

export default View;
