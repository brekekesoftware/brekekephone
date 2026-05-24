import { observer } from 'mobx-react'
import { Component } from 'react'

import { isIos, isWeb } from '@/rn/core/utils/platform'
import { mdiCheck } from '#/assets/icons'
import { Field } from '#/components/field'
import { Layout } from '#/components/layout'
import { DarkModePicker, LanguagePicker } from '#/pages/page-settings-debug'
import type { Account } from '#/stores/account-store'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'
import { RnPicker } from '#/stores/rn-picker'
import { defaultRingtone } from '#/utils/brekeke-utils'
import type { RingtoneOption } from '#/utils/get-ringtone-options'
import {
  getCurrentRingtone,
  getRingtoneOptions,
  handleRingtoneOptionsInSetting,
} from '#/utils/get-ringtone-options'
import PreviewRingtone from '#/utils/preview-ringtone'
import {
  handleUploadRingtone,
  saveRingtoneSelection,
  validateRingtone,
} from '#/utils/ringtone-picker'
import { SyncRingtoneOnForeground } from '#/utils/sync-ringtone-on-foreground'

@observer
export class PageSettingsOther extends Component {
  state = {
    status: '',
    statusText: '',
    ringtoneOptions: [] as RingtoneOption[],
    ringtone: defaultRingtone,
    preview: '',
  }

  componentDidMount = async () => {
    try {
      this.initData()
    } catch (err) {
      console.error('PageSettingsOther componentDidMount:', err)
    }
  }

  componentWillUnmount(): void {
    RnPicker.dismiss()
  }

  initData = async () => {
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

  onChangeRingtone = async (value: string, ca?: Account) => {
    this.stopPreview()
    const hasCall =
      Object.keys(ctx.call.callkeepMap).length ||
      ctx.sip.phone?.getSessionCount() ||
      ctx.call.calls.length

    if (hasCall) {
      const msg = intl`Cannot preview ringtone during a call`
      if (!ctx.toast.items.some(v => v.msg === msg)) {
        ctx.toast.warning(msg, 2000)
      }
      return
    }
    const r = await validateRingtone(value, ca)
    this.setState({ preview: r })
  }

  onSaveRingtone = async (value: string, ca?: Account) => {
    await saveRingtoneSelection(
      value,
      () => this.setState({ ringtone: value }),
      ca,
    )
  }

  onUploadRingtone = async () => {
    try {
      await handleUploadRingtone(this.state.ringtoneOptions, options => {
        this.setState({
          ringtoneOptions: options,
        })
      })
    } catch (err) {
      console.error('PageSettingOther onUploadRingtone:', err)
    }
  }

  onSyncRingtone = ({ ro, r }: { ro: RingtoneOption[]; r: string }) => {
    this.setState({
      ringtoneOptions: ro,
      ringtone: r || defaultRingtone,
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
          label: intl`Select local mp3 as ringtone`,
          onPress: this.onUploadRingtone,
        },
        ...d,
      ]
    }
    return d
  }

  stopPreview = () => this.setState({ preview: '' })

  render() {
    const ca = ctx.auth.getCurrentAccount()
    const description = !ca
      ? intl`App settings and configs`
      : `${ca.pbxUsername} - ${ca.pbxHostname}`

    return (
      <Layout
        title={intl`Settings`}
        description={description}
        dropdown={this.getDropDown()}
        menu='settings'
        subMenu='other'
      >
        <Field isGroup label={intl`DISPLAY`} />
        <LanguagePicker onSelect={this.initData} />
        <DarkModePicker />
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
              onValueChange={v => this.onChangeRingtone(v, ca)}
              onRnPickerConfirm={v => this.onSaveRingtone(v, ca)}
              onRnPickerDismiss={this.stopPreview}
            />
          </>
        )}
        {isIos && (
          <SyncRingtoneOnForeground onForeGround={this.onSyncRingtone} />
        )}
        {!isWeb && this.state.preview && (
          <PreviewRingtone
            source={this.state.preview}
            onFinished={this.stopPreview}
          />
        )}
      </Layout>
    )
  }
}
