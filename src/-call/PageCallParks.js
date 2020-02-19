import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import { TouchableOpacity } from '../-/Rn';
import UserItem from '../-contact/UserItem';
import pbx from '../api/pbx';
import sip from '../api/sip';
import g from '../global';
import authStore from '../global/authStore';
import callStore from '../global/callStore';
import intl from '../intl/intl';
import Field from '../shared/Field';
import Layout from '../shared/Layout';

@observer
class PageCallParks extends React.Component {
  @computed get parkIds() {
    return authStore.currentProfile.parks;
  }
  state = {
    selectedPark: null,
  };

  render() {
    const screen = this.props.screen;
    const goBack =
      screen === `page_phone` ? g.goToPageCallKeypad : g.goToPageCallManage;
    void goBack; // TODO
    return (
      <Layout
        description={intl`Manage your call parks`}
        fabOnNext={this.state.selectedPark ? this.park : null}
        fabOnNextText={intl`START NEW PARK`}
        menu="call"
        subMenu="parks"
        title={intl`Park`}
      >
        <Field isGroup />
        {this.parkIds.length !== 0 &&
          this.parkIds.map((u, i) => (
            <TouchableOpacity key={i} onPress={() => this.selectPark(u)}>
              <UserItem
                key={i}
                name={intl`Parked ${i + 1}`}
                park={intl`Extension *${u}`}
                selected={this.state.selectedPark === u}
              />
            </TouchableOpacity>
          ))}
      </Layout>
    );
  }

  selectPark = selectedPark => {
    this.setState({
      selectedPark:
        selectedPark === this.state.selectedPark ? null : selectedPark,
    });
  };

  park = () => {
    const { selectedPark } = this.state;
    if (!selectedPark) {
      g.showError({
        err: new Error(`No selected park`),
        message: intl`Failed to start new park`,
      });
      return;
    }
    if (callStore.selectedId) {
      const call = callStore.getRunningCall(callStore.selectedId);
      const tenant = call.pbxTenant;
      const talkerId = call.pbxTalkerId;
      pbx
        .parkTalker(tenant, talkerId, selectedPark)
        .then(this.onParkSuccess)
        .catch(this.onParkFailure);
    } else {
      sip.createSession(selectedPark, {
        videoEnabled: false,
      });
      g.goToPageCallManage();
    }
  };

  onParkSuccess = () => {
    g.goToPageCallManage();
  };
  onParkFailure = err => {
    g.showError({ err, message: intl`Failed to park the call` });
  };
}

export default PageCallParks;
