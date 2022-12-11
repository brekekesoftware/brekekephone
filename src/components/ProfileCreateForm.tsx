import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import { observer } from 'mobx-react'
import { FC } from 'react'
import { Platform, View } from 'react-native'

import { Account, accountStore, PNOptions } from '../stores/accountStore'
import { getAuthStore } from '../stores/authStore'
import { intl, intlDebug } from '../stores/intl'
import { RnAlert } from '../stores/RnAlert'
import { useForm } from '../utils/useForm'
import { useStore } from '../utils/useStore'
import { Layout } from './Layout'
import { RnText } from './Rn'

export const ProfileCreateForm: FC<{
  updatingProfile?: Account
  onBack: Function
  onSave: Function
  footerLogout?: boolean
  title: string
  pushNotificationType?: PNOptions
}> = observer(props => {
  const isWeb = Platform.OS === 'web'
  const isIos = Platform.OS === 'ios'
  const updateNotificationType = (profileData: Account | undefined) => {
    if (!profileData) {
      return
    }
    return {
      ...profileData,
      pushNotificationType: profileData.pushNotificationEnabled
        ? 'APNs'
        : undefined,
    }
  }
  // update profile with new function LPC ios
  const isShouldChange =
    isIos && !!!props?.updatingProfile?.pushNotificationType
  const profile = isShouldChange
    ? updateNotificationType(props.updatingProfile)
    : props.updatingProfile

  const m = () => ({
    observable: {
      profile: {
        ...accountStore.genEmptyAccount(),
        ...cloneDeep(profile),
      },
      addingPark: { name: '', number: '' },
    },
    resetAllFields: () => {
      RnAlert.prompt({
        title: intl`Reset`,
        message: intl`Do you want to reset the form to the original data?`,
        onConfirm: () => {
          $.set('profile', (p: Account) => ({
            ...accountStore.genEmptyAccount(),
            ...cloneDeep(profile),
            id: p.id,
          }))
        },
        confirmText: intl`RESET`,
      })
    },
    //
    onAddingParkSubmit: () => {
      $.set('profile', (p: Account) => {
        p.parks = p.parks || []
        p.parkNames = p.parkNames || []
        if ($.addingPark.name && $.addingPark.number) {
          if (p.parkNames.length !== p.parks.length) {
            const { parkNames } = p
            p.parkNames = p.parks.map((_, i) => parkNames[i] || '')
          }
          if (p.parks.includes($.addingPark.number)) {
            RnAlert.error({
              message: intlDebug`Park number ${$.addingPark.number} already exist`,
            })
            return p
          }
          p.parks.push($.addingPark.number)
          p.parkNames.push($.addingPark.name)
          $.addingPark = { name: '', number: '' }
        }
        return p
      })
    },
    onAddingParkRemove: (i: number) => {
      RnAlert.prompt({
        title: intl`Remove Park`,
        message: (
          <>
            <RnText small>
              Park {i + 1}:{' '}
              {$.profile.parks?.[i] + ' - ' + $.profile.parkNames?.[i]}
            </RnText>
            <View />
            <RnText>{intl`Do you want to remove this park?`}</RnText>
          </>
        ),
        onConfirm: () => {
          $.set('profile', (p: Account) => {
            p.parks = p.parks?.filter((p0, i0) => i0 !== i)
            return p
          })
        },
      })
    },
    //
    hasUnsavedChanges: () => {
      const p = props.updatingProfile || accountStore.genEmptyAccount()
      if (!props.updatingProfile) {
        Object.assign(p, {
          id: $.profile.id,
        })
      }
      return !isEqual($.profile, p)
    },
    onBackBtnPress: () => {
      if (!$.hasUnsavedChanges()) {
        props.onBack()
        return
      }
      RnAlert.prompt({
        title: intl`Discard Changes`,
        message: intl`Do you want to discard all unsaved changes and go back?`,
        onConfirm: props.onBack,
        confirmText: intl`DISCARD`,
      })
    },
    onValidSubmit: () => {
      console.log({ profile: $.profile })
      // update value pushNotificationEnabled with case use Ios setting PN
      isIos &&
        $.profile?.pushNotificationType &&
        $.set('profile', (p: Account) => {
          if (p?.pushNotificationType !== 'disabled') {
            p.pushNotificationEnabled = true
          } else {
            p.pushNotificationEnabled = false
          }
          return p
        })

      props.onSave($.profile, $.hasUnsavedChanges())
    },
  })
  type M0 = ReturnType<typeof m>
  type M = Omit<M0, 'observable'> &
    M0['observable'] &
    ReturnType<typeof useStore>
  const $ = useStore(m) as any as M
  const [Form, submitForm] = useForm()
  const as = getAuthStore()
  return (
    <Layout
      description={
        props.updatingProfile
          ? `${props.updatingProfile.pbxUsername} - ${props.updatingProfile.pbxHostname}`
          : intl`Create a new sign in account`
      }
      dropdown={
        props.footerLogout
          ? [
              ...(as.isConnFailure()
                ? [
                    {
                      label: intl`Reconnect to server`,
                      onPress:
                        as.resetFailureStateIncludeUcLoginFromAnotherPlace,
                    },
                  ]
                : []),
              {
                label: intl`Logout`,
                onPress: as.signOut,
                danger: true,
              },
            ]
          : [
              {
                label: intl`Reset form`,
                onPress: $.resetAllFields,
              },
            ]
      }
      fabOnBack={props.footerLogout ? undefined : $.onBackBtnPress}
      fabOnNext={props.footerLogout ? undefined : (submitForm as () => void)}
      menu={props.footerLogout ? 'settings' : undefined}
      onBack={props.footerLogout ? undefined : $.onBackBtnPress}
      subMenu={props.footerLogout ? 'profile' : undefined}
      title={props.title}
    >
      <Form
        $={$}
        fields={[
          {
            isGroup: true,
            label: intl`PBX`,
          },
          {
            // autoFocus: true, // TODO Animation issue
            disabled: props.footerLogout,
            name: 'pbxUsername',
            label: intl`USERNAME`,
            rule: 'required',
          },
          {
            disabled: props.footerLogout,
            secureTextEntry: true,
            name: 'pbxPassword',
            label: intl`PASSWORD`,
            rule: 'required',
          },
          {
            disabled: props.footerLogout,
            name: 'pbxTenant',
            label: intl`TENANT`,
          },
          {
            disabled: props.footerLogout,
            name: 'pbxHostname',
            label: intl`HOSTNAME`,
            rule: 'required|hostname',
          },
          {
            disabled: props.footerLogout,
            keyboardType: 'numeric',
            name: 'pbxPort',
            label: intl`PORT`,
            rule: 'required|port',
          },
          {
            disabled: props.footerLogout,
            type: 'RnPicker',
            name: 'pbxPhoneIndex',
            label: intl`PHONE`,
            rule: 'required',
            options: [1, 2, 3, 4].map(v => ({
              key: `${v}`,
              label: intl`Phone ${v}`,
            })),
          },
          {
            disabled: props.footerLogout,
            type: 'Switch',
            name: 'pbxTurnEnabled',
            label: intl`TURN`,
          },
          !isIos
            ? {
                disabled: props.footerLogout,
                type: 'Switch',
                name: 'pushNotificationEnabled',
                label: intl`PUSH NOTIFICATION`,
                hidden: isWeb,
              }
            : {
                disabled: props.footerLogout,
                type: 'RnPicker',
                name: 'pushNotificationType',
                label: intl`PUSH NOTIFICATION`,
                rule: 'required',
                hidden: isWeb,
                options: [
                  { key: 'disabled', label: intl`Disabled` },
                  { key: 'APNs', label: intl`APNs Push Notification` },
                  { key: 'LPC', label: intl`LPC Push Notification` },
                ],
              },
          {
            disabled: props.footerLogout,
            name: 'pushNotificationSSID',
            label: intl`SSID`,
            rule: 'required',
            hidden: !isIos || $.profile?.pushNotificationType !== 'LPC',
          },
          {
            isGroup: true,
            label: intl`UC`,
            hasMargin: true,
          },
          {
            disabled: props.footerLogout,
            type: 'Switch',
            name: 'ucEnabled',
            label: intl`UC`,
            onValueChange: (v: boolean) => {
              $.set('profile', (p: Account) => {
                p.ucEnabled = v
                return p
              })
            },
          },
          {
            isGroup: true,
            label: intl`PARKS (${$.profile.parks?.length})`,
            hasMargin: true,
          },
          ...($.profile.parks?.map((p, i) => {
            const parkName = $.profile.parkNames?.[i]
            return {
              disabled: true,
              name: `parks[${i}]`,
              type: 'PARK',
              value: `${p} ${parkName ? '- ' + parkName : ''}`,
              label: intl`PARK ${i + 1}`,
              onRemoveBtnPress: props.footerLogout
                ? null
                : () => $.onAddingParkRemove(i),
            }
          }) || []),
          ...(props.footerLogout
            ? []
            : [
                {
                  name: 'parks[new]',
                  label: intl`NEW PARK`,
                  type: 'PARK',
                  value: $.addingPark,
                  onValueChange: (v: { number: string; name?: string }) =>
                    $.set('addingPark', v),
                  onCreateBtnPress: $.onAddingParkSubmit,
                },
              ]),
        ]}
        k='profile'
        onValidSubmit={$.onValidSubmit}
      />
    </Layout>
  )
})
