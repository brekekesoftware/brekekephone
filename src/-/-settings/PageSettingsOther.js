import { mdiCheck, mdiTranslate } from '@mdi/js'
import { observer } from 'mobx-react'
import React, { Component } from 'react'

import uc from '../api/uc'
import g from '../global'
import authStore from '../global/authStore'
import intl, { intlDebug } from '../intl/intl'
import Field from '../shared/Field'
import Layout from '../shared/Layout'

@observer
class PageSettingsOther extends Component {
  state = {
    status: '',
    statusText: '',
  }
  componentDidMount() {
    const me = uc.me()
    this.setState({
      status: me.status,
      statusText: me.statusText,
    })
  }
  setStatusText = statusText => {
    this.setState({ statusText })
  }
  submitStatusText = () => {
    this.setStatus(this.state.status, this.state.statusText)
  }
  submitStatus = status => {
    this.setStatus(status, this.state.statusText)
  }
  setStatus = (status, statusText) => {
    uc.setStatus(status, statusText)
      .then(() => {
        const me = uc.me()
        this.setState({
          status: me.status,
          statusText: me.statusText,
        })
      })
      .catch(err => {
        g.showError({
          message: intlDebug`Failed to change UC status`,
          err,
        })
      })
  }
  render() {
    return (
      <Layout
        description={intl`Other settings for PBX/UC`}
        dropdown={[
          ...(authStore.isConnFailure
            ? [
                {
                  label: intl`Reconnect to server`,
                  onPress: authStore.reconnect,
                },
              ]
            : []),
          {
            label: intl`Logout`,
            onPress: authStore.signOut,
            danger: true,
          },
        ]}
        menu="settings"
        subMenu="other"
        title={intl`Other Settings`}
      >
        <Field isGroup label={intl`LOCALIZATION`} />
        <Field
          icon={mdiTranslate}
          label={intl`LANGUAGE`}
          onTouchPress={g.selectLocale}
          value={g.locale}
          valueRender={() => g.localeName}
        />
        {authStore.currentProfile.ucEnabled && (
          <React.Fragment>
            <Field isGroup label={intl`UC`} />
            <Field
              disabled={!authStore.currentProfile.ucEnabled}
              label={intl`STATUS`}
              onValueChange={this.submitStatus}
              options={[
                { key: 'online', label: intl`Online` },
                { key: 'offline', label: intl`Invisible` },
                { key: 'busy', label: intl`Busy` },
              ]}
              type="Picker"
              value={this.state.status}
            />
            <Field
              createBtnIcon={mdiCheck}
              disabled={!authStore.currentProfile.ucEnabled}
              label={intl`STATUS NOTE`}
              onCreateBtnPress={this.submitStatusText}
              onSubmitEditing={this.submitStatusText}
              onValueChange={this.setStatusText}
              value={this.state.statusText}
            />
          </React.Fragment>
        )}
      </Layout>
    )
  }
}

export default PageSettingsOther
