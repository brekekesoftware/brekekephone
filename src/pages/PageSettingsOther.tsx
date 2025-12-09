import { observer } from 'mobx-react'
import { Component } from 'react'
import { StyleSheet } from 'react-native'

import { mdiCheck, mdiTranslate } from '#/assets/icons'
import { Field } from '#/components/Field'
import { Layout } from '#/components/Layout'
import { RnText } from '#/components/RnText'
import { RnTouchableOpacity } from '#/components/RnTouchableOpacity'
import { v } from '#/components/variables'
import { isIos, isWeb } from '#/config'
import type { Account } from '#/stores/accountStore'
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
import { handleUploadRingtone } from '#/utils/ringtonePicker'
import { SyncRingtoneOnForeground } from '#/utils/SyncRingtoneOnForeground'

const css = StyleSheet.create({
  Btn: {
    borderRadius: 0,
    width: '95%',
    paddingVertical: 8,
    backgroundColor: v.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 15,
  },
  Text: {
    color: v.revColor,
    fontSize: 11,
    fontWeight: 'bold',
  },
})

@observer
export class PageSettingsOther extends Component {
  state = {
    status: '',
    statusText: '',
    ringtoneOptions: [] as RingtoneOption[],
    ringtone: defaultRingtone,
  }

  componentDidMount = async () => {
    try {
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
    } catch (err) {
      console.error('PageSettingsOther componentDidMount:', err)
    }
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
  }

  onSaveRingtone = async (value: string, ca?: Account) => {
    if (!ca) {
      ctx.toast.warning(
        intl`Unable to change ringtone. Please try again later`,
        2000,
      ) // todo internationalize
      return
    }
    ca.ringtone = value
    await ctx.account.saveAccountsToLocalStorageDebounced()
    ctx.toast.success(intl`Change ringtone successfully`, 2000) // todo internationalize
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
            <RnTouchableOpacity
              onPress={() => this.onSaveRingtone(this.state.ringtone, ca)}
              style={css.Btn}
            >
              <RnText style={css.Text}>{intl`SAVE`}</RnText>
            </RnTouchableOpacity>
          </>
        )}
        {isIos && (
          <SyncRingtoneOnForeground onForeGround={this.onSyncRingtone} />
        )}
      </Layout>
    )
  }
}
