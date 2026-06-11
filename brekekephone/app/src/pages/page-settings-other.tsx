import { isIos, isWeb } from '@rntwsc/rn/core/utils/platform'
import { observer } from 'mobx-react'
import { useEffect, useRef, useState } from 'react'

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
import { PreviewRingtone } from '#/utils/preview-ringtone'
import {
  handleUploadRingtone,
  saveRingtoneSelection,
  validateRingtone,
} from '#/utils/ringtone-picker'
import { SyncRingtoneOnForeground } from '#/utils/sync-ringtone-on-foreground'

export const PageSettingsOther = observer(() => {
  const mountedRef = useRef(true)
  const [status, setStatus] = useState('')
  const [statusText, setStatusText] = useState('')
  const [ringtoneOptions, setRingtoneOptions] = useState<RingtoneOption[]>([])
  const [ringtone, setRingtone] = useState(defaultRingtone)
  const [preview, setPreview] = useState('')

  const initData = async () => {
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
    if (!mountedRef.current) {
      return
    }

    setStatus(me.status)
    setStatusText(me.statusText)
    setRingtoneOptions(ro)
    setRingtone(r)
  }

  useEffect(() => {
    mountedRef.current = true
    try {
      initData()
    } catch (err) {
      console.error('PageSettingsOther componentDidMount:', err)
    }
    return () => {
      mountedRef.current = false
      RnPicker.dismiss()
    }
  }, [])

  const submitStatusText = () => {
    setStatusFn(status, statusText)
  }
  const submitStatus = (s: string) => {
    setStatusFn(s, statusText)
  }
  const setStatusFn = (s: string, text: string) => {
    ctx.uc
      .setStatus(s, text)
      .then(() => {
        if (!mountedRef.current) {
          return
        }
        const me = ctx.uc.me()
        setStatus(me.status)
        setStatusText(me.statusText)
      })
      .catch((err: Error) => {
        RnAlert.error({
          message: intlDebug`Failed to change UC status`,
          err,
        })
      })
  }

  const onChangeRingtone = async (value: string, ca?: Account) => {
    stopPreview()
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
    if (!mountedRef.current) {
      return
    }
    setPreview(r)
  }

  const onSaveRingtone = async (value: string, ca?: Account) => {
    await saveRingtoneSelection(
      value,
      () => {
        if (mountedRef.current) {
          setRingtone(value)
        }
      },
      ca,
    )
  }

  const onUploadRingtone = async () => {
    try {
      await handleUploadRingtone(ringtoneOptions, options => {
        if (mountedRef.current) {
          setRingtoneOptions(options)
        }
      })
    } catch (err) {
      console.error('PageSettingOther onUploadRingtone:', err)
    }
  }

  const onSyncRingtone = ({ ro, r }: { ro: RingtoneOption[]; r: string }) => {
    if (!mountedRef.current) {
      return
    }
    setRingtoneOptions(ro)
    setRingtone(r || defaultRingtone)
  }

  const getDropDown = () => {
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
          onPress: onUploadRingtone,
        },
        ...d,
      ]
    }
    return d
  }

  const stopPreview = () => setPreview('')

  const ca = ctx.auth.getCurrentAccount()
  const description = !ca
    ? intl`App settings and configs`
    : `${ca.pbxUsername} - ${ca.pbxHostname}`

  return (
    <Layout
      title={intl`Settings`}
      description={description}
      dropdown={getDropDown()}
      menu='settings'
      subMenu='other'
    >
      <Field isGroup label='ACCOUNT' />
      <PushNotificationSwitch />

      <Field isGroup label='UC' />
      <Field
        label={intl`UC`}
        onValueChange={() => {
          if (!ca) {
            return
          }
          ca.ucEnabled = !ca.ucEnabled
          if (!ca.ucEnabled) {
            ctx.authUC.dispose()
          } else {
            ctx.authUC.authWithCheckDebounced()
          }
          ctx.account.saveAccountsToLocalStorageDebounced()
        }}
        type='Switch'
        value={ca?.ucEnabled}
      />
      <Field
        label={intl`STATUS`}
        onValueChange={submitStatus}
        options={[
          {
            key: 'online',
            label: intl`Online`,
          },
          {
            key: 'offline',
            label: intl`Invisible`,
          },
          {
            key: 'busy',
            label: intl`Busy`,
          },
        ]}
        type='RnPicker'
        value={status}
        disabled={ctx.auth.ucState !== 'success'}
      />
      <Field
        createBtnIcon={mdiCheck}
        label={intl`STATUS NOTE`}
        onCreateBtnPress={submitStatusText}
        onSubmitEditing={submitStatusText}
        onValueChange={setStatusText}
        value={statusText}
        disabled={ctx.auth.ucState !== 'success'}
      />

      {!isWeb && (
        <>
          <Field isGroup label={intl`Ringtone`} />
          <Field
            label={intl`INCOMING CALL RINGTONE`}
            options={ringtoneOptions}
            type='RnPicker'
            value={ringtone}
            onValueChange={v => onChangeRingtone(v, ca)}
            onRnPickerConfirm={v => onSaveRingtone(v, ca)}
            onRnPickerDismiss={stopPreview}
          />
        </>
      )}
      {isIos && <SyncRingtoneOnForeground onForeGround={onSyncRingtone} />}
      {!isWeb && preview && (
        <PreviewRingtone source={preview} onFinished={stopPreview} />
      )}

      <Field isGroup label={intl`DISPLAY`} />
      <LanguagePicker onSelect={initData} />
      <DarkModePicker />
    </Layout>
  )
})

const PushNotificationSwitch = observer(() => {
  const mountedRef = useRef(true)
  const [loading, setLoading] = useState(false)
  const ca = ctx.auth.getCurrentAccount()

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  return (
    <Field
      label={intl`PUSH NOTIFICATION`}
      onValueChange={async () => {
        if (!ca) {
          return
        }
        const initial = ca.pushNotificationEnabled
        ca.pushNotificationEnabled = !initial
        ca.pushNotificationEnabledSynced = false
        ctx.account.saveAccountsToLocalStorageDebounced()
        setLoading(true)
        await ctx.pnToken.sync(ca, {
          noUpsert: true,
          onError: err => {
            ca.pushNotificationEnabled = initial
            ca.pushNotificationEnabledSynced = false
            ctx.account.saveAccountsToLocalStorageDebounced()
            RnAlert.error({
              message: intlDebug`Failed to sync push notification status`,
              err,
            })
          },
        })
        if (mountedRef.current) {
          setLoading(false)
        }
      }}
      type='Switch'
      value={ca?.pushNotificationEnabled}
      loading={loading}
    />
  )
})
