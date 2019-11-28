import { computed } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import authStore from '../-/authStore';
import callStore from '../-/callStore';
import UserItem from '../-contact/UserItem';
import g from '../global';
import { TouchableOpacity } from '../native/Rn';
import Field from '../shared/Field';
import Layout from '../shared/Layout';

@observer
class PagePhoneParks extends React.Component {
  @computed get parkIds() {
    return authStore.profile.parks;
  }

  static contextTypes = {
    pbx: PropTypes.object.isRequired,
    sip: PropTypes.object.isRequired,
  };

  state = {
    selectedPark: null,
  };

  render() {
    const screen = this.props.screen;
    const goBack =
      screen === `page_phone` ? g.goToPagePhoneKeypad : g.goToCallsManage;
    return (
      <Layout
        footer={{
          navigation: {
            menu: `phone`,
            subMenu: `parks`,
          },
        }}
        header={{
          title: `Call Park`,
          onBackBtnPress: goBack,
          onParkBtnPress: this.park,
        }}
      >
        <Field isGroup />
        {this.parkIds.length !== 0 &&
          this.parkIds.map((u, i) => (
            <TouchableOpacity key={i} onPress={() => this.selectPark(u)}>
              <UserItem
                detail={true}
                key={i}
                last={i === this.parkIds.length - 1}
                name={`Parked ${i + 1}`}
                park={`Extension *${u}`}
                selected={this.state.selectedPark === u}
              />
            </TouchableOpacity>
          ))}
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

    if (callStore.selectedId) {
      const call = callStore.getRunningCall(callStore.selectedId);
      const tenant = call.pbxTenant;
      const talkerId = call.pbxTalkerId;
      pbx
        .parkTalker(tenant, talkerId, selectedPark)
        .then(this.onParkSuccess)
        .catch(this.onParkFailure);
    } else {
      const { sip } = this.context;
      sip.createSession(selectedPark, {
        videoEnabled: false,
      });

      g.goToCallsManage();
    }
  };

  onParkSuccess = () => {
    g.goToCallsManage();
  };

  onParkFailure = err => {
    g.showError({ err, message: `park the call` });
  };
}

export default PagePhoneParks;
