import { observer } from 'mobx-react'
import { Component } from 'react'
import { Platform } from 'react-native'

import { uc } from '../api/uc'
import { mdiCheck, mdiTranslate } from '../assets/icons'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { getAuthStore } from '../stores/authStore'
import { debugStore } from '../stores/debugStore'
import { intl, intlDebug } from '../stores/intl'
import { intlStore } from '../stores/intlStore'
import { Nav } from '../stores/Nav'
import { RnAlert } from '../stores/RnAlert'

@observer
export class PageSettingsOther extends Component {
  state = {
    status: '',
    statusText: '',
  }
  componentDidMount = () => {
    const me = uc.me()
    this.setState({
      status: me.status,
      statusText: me.statusText,
    })
  }
  setStatusText = (statusText: string) => {
    this.setState({ statusText })
  }
  submitStatusText = () => {
    this.setStatus(this.state.status, this.state.statusText)
  }
  submitStatus = (status: string) => {
    this.setStatus(status, this.state.statusText)
  }
  setStatus = (status: string, statusText: string) => {
    uc.setStatus(status, statusText)
      .then(() => {
        const me = uc.me()
        this.setState({
          status: me.status,
          statusText: me.statusText,
        })
      })
      .catch((err: Error) => {
        RnAlert.error({
          message: intlDebug`Failed to change UC status`,
          err,
        })
      })
  }
  render() {
    const as = getAuthStore()
    const ca = as.getCurrentAccount()
    return (
      <Layout
        description={intl`Other settings for PBX/UC`}
        dropdown={[
          ...(as.isConnFailure()
            ? [
                {
                  label: intl`Reconnect to server`,
                  onPress: as.resetFailureStateIncludePbxOrUc,
                },
              ]
            : []),
          ...(Platform.OS !== 'web'
            ? [
                {
                  label: intl`Open debug log`,
                  onPress: Nav().goToPageSettingsDebugFiles,
                },
              ]
            : []),
          {
            label: intl`Logout`,
            onPress: as.signOut,
            danger: true,
          },
        ]}
        menu='settings'
        subMenu='other'
        title={intl`Other Settings`}
      >
        <Field isGroup label={intl`LOCALIZATION`} />
        <Field
          icon={mdiTranslate}
          label={intl`LANGUAGE`}
          onTouchPress={intlStore.selectLocale}
          value={intlStore.locale}
          valueRender={() => intlStore.getLocaleName()}
        />
        {ca?.ucEnabled && (
          <>
            <Field isGroup label='UC' />
            <Field
              disabled={!ca.ucEnabled}
              label={intl`STATUS`}
              onValueChange={this.submitStatus}
              options={[
                { key: 'online', label: intl`Online` },
                { key: 'offline', label: intl`Invisible` },
                { key: 'busy', label: intl`Busy` },
              ]}
              type='RnPicker'
              value={this.state.status}
            />
            <Field
              createBtnIcon={mdiCheck}
              disabled={!ca.ucEnabled}
              label={intl`STATUS NOTE`}
              onCreateBtnPress={this.submitStatusText}
              onSubmitEditing={this.submitStatusText}
              onValueChange={this.setStatusText}
              value={this.state.statusText}
            />
          </>
        )}
      </Layout>
    )
  }
}
