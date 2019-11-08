import { computed } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import authStore from '../-/authStore';
import callStore from '../-/callStore';
import g from '../global';
import { TouchableOpacity } from '../native/Rn';
import FieldGroup from '../shared/FieldGroup';
import Item from '../shared/ItemUser';
import Layout from '../shared/Layout';

@observer
class CallPark extends React.Component {
  @computed get parkIds() {
    return authStore.profile.parks;
  }

  static contextTypes = {
    pbx: PropTypes.object.isRequired,
  };

  state = {
    selectedPark: null,
  };

  render() {
    return (
      <Layout
        header={{
          title: `Call Park`,
          onBackBtnPress: g.goToCallKeypad,
        }}
      >
        <React.Fragment>
          <FieldGroup>
            {this.parkIds.length !== 0 &&
              this.parkIds.map((u, i) => (
                <TouchableOpacity onPress={() => this.selectPark(u)}>
                  <Item
                    last={i === this.parkIds.length - 1}
                    name={`Parked ${i + 1}`}
                    detail={true}
                    park={`Extension *${u}`}
                    selected={this.state.selectedPark === u}
                  />
                </TouchableOpacity>
              ))}
          </FieldGroup>
        </React.Fragment>
      </Layout>
    );
  }

  selectPark = selectedPark => {
    this.setState({
      selectedPark,
    });
  };

  park = () => {
    const { selectedPark } = this.state;

    if (!selectedPark) {
      g.showError({
        err: new Error(`No selected park`),
        message: `start new park`,
      });
      return;
    }

    const { pbx } = this.context;

    const call = callStore.getRunningCall(this.props.match.params.call);

    const tenant = call.pbxTenant;
    const talkerId = call.pbxTalkerId;
    pbx
      .parkTalker(tenant, talkerId, selectedPark)
      .then(this.onParkSuccess)
      .catch(this.onParkFailure);
  };

  onParkSuccess = () => {
    g.goToCallsManage();
  };

  onParkFailure = err => {
    g.showError({ err, message: `park the call` });
  };
}

export default CallPark;
