import { observer } from 'mobx-react'
import { Component } from 'react'

import { mdiCheck, mdiTranslate } from '#/assets/icons'
import { Field } from '#/components/Field'
import { Layout } from '#/components/Layout'
import { isIos, isWeb } from '#/config'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'
import { defaultRingtone } from '#/utils/BrekekeUtils'
import type { RingtoneOption } from '#/utils/getRingtoneOptions'
import {
  getCurrentRingtone,
  getRingtoneOptions,
  handleRingtoneOptionsInSetting,
} from '#/utils/getRingtoneOptions'
import { pickRingtone } from '#/utils/ringtonePicker'
import { SyncRingtoneOnForeground } from '#/utils/SyncRingtoneOnForeground'

@observer
export class PageSettingsOther extends Component {
  state = {
    status: '',
    statusText: '',
    ringtoneOptions: [] as RingtoneOption[],
    ringtone: '',
  }

  componentDidMount = async () => {
    const me = ctx.uc.me()
    let ro: RingtoneOption[] = []
    let r = getCurrentRingtone()
    if (isIos) {
      const d = await handleRingtoneOptionsInSetting()
      if (d) {
        ro = d.ro
        r = d.r
      }
    } else {
      ro = await getRingtoneOptions()
    }

    this.setState({
      status: me.status,
      statusText: me.statusText,
      ringtoneOptions: ro,
      ringtone: r,
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
    const ca = ctx.auth.getCurrentAccount()
    if (!ca) {
      return
    }
    ca.ringtone = value || defaultRingtone
    ctx.account.saveAccountsToLocalStorageDebounced()
  }

  onUploadRingtone = async () => {
    const u = await pickRingtone()
    if (u) {
      setTimeout(
        async () =>
          this.setState({
            ringtoneOptions: await getRingtoneOptions(),
          }),
        1000,
      )
    }
  }

  onSyncRingtone = ({ ro, r }: { ro: RingtoneOption[]; r: string }) => {
    this.setState({
      ringtoneOptions: ro,
      ringtone: r,
    })
  }

  getDropDown = () => {
    let d = [
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
    ]
    if (!isWeb) {
      d = [
        {
          label: intl`Upload ringtone`,
          onPress: this.onUploadRingtone,
        },
        ...d,
      ]
    }
    return d
  }

  render() {
    const ca = ctx.auth.getCurrentAccount()

    return (
      <Layout
        description={intl`Other settings for PBX/UC`}
        dropdown={this.getDropDown()}
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
        {isIos && (
          <SyncRingtoneOnForeground onForeGround={this.onSyncRingtone} />
        )}
      </Layout>
    )
  }
}
