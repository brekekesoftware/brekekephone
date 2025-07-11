import { observer } from 'mobx-react'
import { Component } from 'react'

import { mdiCheck, mdiTranslate } from '#/assets/icons'
import { Field } from '#/components/Field'
import { Layout } from '#/components/Layout'
import { isWeb } from '#/config'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'
import type { RingtoneOptionsType } from '#/utils/handleRingtone'
import { getRingtoneOptions } from '#/utils/handleRingtone'
import { defaultRingtone } from '#/utils/RnNativeModules'

@observer
export class PageSettingsOther extends Component {
  state = {
    status: '',
    statusText: '',
    ringtoneOptions: [] as RingtoneOptionsType,
    ringtone: ctx.auth.getCurrentAccount()?.ringtone,
  }
  componentDidMount = async () => {
    const me = ctx.uc.me()
    this.setState({
      status: me.status,
      statusText: me.statusText,
      ringtoneOptions: isWeb ? [] : await getRingtoneOptions(),
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
    ctx.uc
      .setStatus(status, statusText)
      .then(() => {
        const me = ctx.uc.me()
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

  onChangeRingtone = value => {
    this.setState({ ringtone: value })
    const account = ctx.auth.getCurrentAccount()
    if (!!account) {
      ctx.account.accounts.map(v => {
        if (v.id === account.id) {
          v.ringtone = value
          v.ringtoneUri =
            this.state.ringtoneOptions.filter(v => v.key === value)?.[0].uri ??
            defaultRingtone
        }
      })
      ctx.account.saveAccountsToLocalStorageDebounced()
    }
  }

  render() {
    const ca = ctx.auth.getCurrentAccount()
    return (
      <Layout
        description={intl`Other settings for PBX/UC`}
        dropdown={[
          ...(ctx.auth.isConnFailure()
            ? [
                {
                  label: intl`Reconnect to server`,
                  onPress: ctx.auth.resetFailureStateIncludePbxOrUc,
                },
              ]
            : []),
          ...(!isWeb
            ? [
                {
                  label: intl`Open debug log`,
                  onPress: ctx.nav.goToPageSettingsDebugFiles,
                },
              ]
            : []),
          {
            label: intl`Logout`,
            onPress: ctx.auth.signOut,
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
          onTouchPress={ctx.intl.selectLocale}
          value={ctx.intl.locale}
          valueRender={() => ctx.intl.getLocaleName()}
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
        {!isWeb && (
          <>
            <Field isGroup label={intl`Ringtone`} />
            <Field
              label={intl`INCOMING CALL RINGTONE`}
              options={this.state.ringtoneOptions}
              type='RnPicker'
              value={this.state.ringtone}
              onValueChange={this.onChangeRingtone}
            />
          </>
        )}
      </Layout>
    )
  }
}
