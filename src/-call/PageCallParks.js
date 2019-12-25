import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import UserItem from '../-contact/UserItem';
import pbx from '../api/pbx';
import sip from '../api/sip';
import g from '../global';
import authStore from '../global/authStore';
import callStore from '../global/callStore';
import { TouchableOpacity } from '../native/Rn';
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
        footer={{
          navigation: {
            menu: `call`,
          },
        }}
        header={{
          description: `Manage your call parks`,
          title: `Parks`,
          onBackBtnPress: null,
          onParkBtnPress: this.park,
          navigation: {
            menu: `call`,
            subMenu: `parks`,
          },
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
    g.showError({ err, message: `park the call` });
  };
}

export default PageCallParks;
