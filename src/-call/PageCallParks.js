import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import { TouchableOpacity } from '../-/Rn';
import UserItem from '../-contact/UserItem';
import sip from '../api/sip';
import g from '../global';
import authStore from '../global/authStore';
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
                name={intl`Park ${i + 1}: ${u}`}
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
        message: intl.debug`No selected park to start`,
      });
      return;
    }
    sip.createSession(selectedPark, {
      videoEnabled: false,
    });
    g.goToPageCallManage();
  };

  onParkSuccess = () => {
    g.goToPageCallManage({ changeTitle: intl`Call park is success` });
  };
  onParkFailure = err => {
    g.showError({
      message: intl.debug`Failed to park the call`,
      err,
    });
  };
}

export default PageCallParks;
