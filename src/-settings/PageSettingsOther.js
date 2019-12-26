import { mdiCheck } from '@mdi/js';
import { observer } from 'mobx-react';
import React, { Component } from 'react';

import uc from '../api/uc';
import g from '../global';
import authStore from '../global/authStore';
import Field from '../shared/Field';
import Layout from '../shared/Layout';

@observer
class PageSettingsOther extends Component {
  state = {
    status: ``,
    statusText: ``,
  };
  componentDidMount() {
    const me = uc.me();
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
    uc.setStatus(status, statusText)
      .then(() => {
        const me = uc.me();
        this.setState({
          status: me.status,
          statusText: me.statusText,
        });
      })
      .catch(err => {
        g.showError({ message: `change UC status`, err });
      });
  };
  render() {
    return (
      <Layout
        footer={{
          navigation: {
            menu: `settings`,
            subMenu: `other`,
          },
        }}
        header={{
          description: `Other settings for PBX/UC`,
          title: `Other settings`,
          navigation: {
            menu: `settings`,
            subMenu: `other`,
          },
        }}
      >
        {authStore.currentProfile?.ucEnabled && (
          <React.Fragment>
            <Field isGroup label={`UC`} />
            <Field
              disabled={!authStore.currentProfile?.ucEnabled}
              label={`STATUS`}
              onValueChange={this.submitStatus}
              options={[
                { key: `online`, label: `Online` },
                { key: `offline`, label: `Invisible` },
                { key: `busy`, label: `Busy` },
              ]}
              type={`Picker`}
              value={this.state.status}
            />
            <Field
              createBtnIcon={mdiCheck}
              disabled={!authStore.currentProfile?.ucEnabled}
              label={`STATUS NOTE`}
              onCreateBtnPress={this.submitStatusText}
              onSubmitEditing={this.submitStatusText}
              onValueChange={this.setStatusText}
              value={this.state.statusText}
            />
          </React.Fragment>
        )}
      </Layout>
    );
  }
}

export default PageSettingsOther;
