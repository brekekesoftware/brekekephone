import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import g from '../global';
import authStore from '../global/authStore';
import Field from '../shared/Field';
import Layout from '../shared/Layout';

@observer
class PageSettingsOther extends Component {
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

  setStatusText = statusText => {
    this.setState({ statusText });
  };
  submitStatusText = () => {
    this.setStatus(this.state.status, this.state.statusText);
  };
  submitStatus = status => {
    this.setStatus(status, this.state.statusText);
  };

  setStatus = (status, statusText) => {
    this.context.uc
      .setStatus(status, statusText)
      .then(() => {
        const me = this.context.uc.me();
        this.setState({
          status: me.status,
          statusText: me.statusText,
        });
      })
      .catch(() => {
        g.showError(`to change UC status`);
      });
  };

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
        <Field isGroup label={`UC`} />
        <Field
          disabled={!authStore.profile?.ucEnabled}
          label={`Status`}
          onValueChange={this.submitStatus}
          options={[
            { key: `offline`, label: `Offline` },
            { key: `online`, label: `Online` },
            { key: `busy`, label: `Busy` },
          ]}
          type={`Picker`}
          value={this.state.status}
        />
        <Field
          disabled={!authStore.profile?.ucEnabled}
          label={`Status note`}
          onSubmitEditing={this.submitStatusText}
          onValueChange={this.setStatusText}
          value={this.state.statusText}
        />
      </Layout>
    );
  }
}

export default PageSettingsOther;
