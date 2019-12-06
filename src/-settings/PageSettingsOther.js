import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import g from '../global';
import Field from '../shared/Field';
import Layout from '../shared/Layout';

@observer
class Setting extends Component {
  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  state = {
    status: ``,
    statusText: ``,
  };

  componentDidMount() {
    const me = this.context.uc.me();
    this.setState({
      status: me.status,
      statusText: me.statusText,
    });
  }

  render() {
    return (
      <Layout
        footer={{
          navigation: {
            menu: `settings`,
            subMenu: `settings`,
          },
        }}
        header={{
          description: `Other settings for PBX/UC`,
          title: `Other settings`,
          navigation: {
            menu: `settings`,
            subMenu: `settings`,
          },
        }}
      >
        <Field
          label={`Uc status`}
          onValueChange={this.setStatus}
          options={[
            { key: `offline`, label: `offline` },
            { key: `online`, label: `online` },
            { key: `busy`, label: `busy` },
          ]}
          type={`Picker`}
          value={this.state.status}
        />

        <Field
          label={`UC status note`}
          onSubmitEditing={this.submitStatusText}
          onValueChange={this.setStatusText}
          value={this.state.statusText}
        />
      </Layout>
    );
  }

  onSetChatStatusSuccess = () => {
    const me = this.context.uc.me();
    this.setState({
      status: me.status,
      statusText: me.statusText,
    });
  };

  onSetChatStatusFailure = () => {
    g.showError(`to change chat status`);
  };

  setStatus = status => {
    const { uc } = this.context;
    uc.setStatus(status, this.state.statusText)
      .then(this.onSetChatStatusSuccess)
      .catch(this.onSetChatStatusFailure);
  };

  setStatusText = statusText => {
    this.setState({ statusText });
  };

  submitStatusText = () => {
    const { status } = this.state;
    this.setStatus(status, this.state.statusText);
  };
}

export default Setting;
