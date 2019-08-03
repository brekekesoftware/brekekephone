import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { createModelView } from 'redux-model';

import * as routerUtils from '../../mobx/routerStore';
import UI from './ui';
import toast from '../../nativeModules/toast';

@observer
@createModelView(
  getter => state => ({
    pbxUserIds: getter.pbxUsers.idsByOrder(state),
    pbxUserById: getter.pbxUsers.detailMapById(state),
    parkingIds: getter.parkingCalls.idsByOrder(state),
  }),
  action => emit => ({
    //
  }),
)
class View extends Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
  };

  static defaultProps = {
    pbxUserIds: [],
    pbxUserById: {},
  };

  state = {
    target: '',
    video: false,
  };

  render = () => (
    <UI
      target={this.state.target}
      matchIds={this.getMatchIds()}
      video={this.state.video}
      resolveMatch={this.resolveMatch}
      setTarget={this.setTarget}
      selectMatch={this.selectMatch}
      setVideo={this.setVideo}
      create={this.create}
      calls={routerUtils.goToCallsManage}
      recent={routerUtils.goToCallsRecent}
      callVoice={this.callVoice}
      callVideo={this.callVideo}
      parkingIds={this.props.parkingIds}
    />
  );

  setTarget = target => {
    this.setState({
      target,
    });
  };

  isMatchUser = id => {
    const { pbxUserById } = this.props;

    const searchTextLC = this.state.target.toLowerCase();
    const userId = id && id.toLowerCase();
    let pbxUserName;

    const pbxUser = pbxUserById[id] || {
      name: '',
    };

    if (pbxUser) {
      pbxUserName = pbxUser.name.toLowerCase();
    } else {
      pbxUserName = '';
    }

    return userId.includes(searchTextLC) || pbxUserName.includes(searchTextLC);
  };

  getMatchIds = () => this.props.pbxUserIds.filter(this.isMatchUser);

  resolveMatch = id => {
    const match = this.props.pbxUserById[id];

    return {
      name: match.name,
      number: id,
      calling: !!match.callingTalkers.length,
      ringing: !!match.ringingTalkers.length,
      talking: !!match.talkingTalkers.length,
      holding: !!match.holdingTalkers.length,
    };
  };

  selectMatch = number => {
    this.setTarget(number);
  };

  setVideo = video => {
    this.setState({
      video,
    });
  };

  create = match => {
    const { target, video } = this.state;

    if (!target.trim()) {
      toast.error('No target');
      return;
    }

    const { sip } = this.context;

    sip.createSession(target, {
      videoEnabled: video,
    });

    routerUtils.goToCallsManage();
  };

  call = (target, bVideoEnabled) => {
    if (!target.trim()) {
      toast.error('No target');
      return;
    }

    const { sip } = this.context;

    sip.createSession(target, {
      videoEnabled: bVideoEnabled,
    });

    routerUtils.goToCallsManage();
  };

  callVoice = match => {
    const { target } = this.state;

    this.call(target, false);
  };

  callVideo = match => {
    const { target } = this.state;

    this.call(target, true);
  };
}

export default View;
