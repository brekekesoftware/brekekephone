import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import { observer } from 'mobx-react'
import React, { FC } from 'react'
import { Platform, View } from 'react-native'

import { getAuthStore } from '../stores/authStore'
import intl from '../stores/intl'
import profileStore, { Profile } from '../stores/profileStore'
import RnAlert from '../stores/RnAlert'
import useForm from '../utils/useForm'
import useStore from '../utils/useStore'
import Layout from './Layout'
import { RnText } from './Rn'

const ProfileCreateForm: FC<{
  updatingProfile?: Profile
  onBack: Function
  onSave: Function
  footerLogout?: boolean
  title: string
}> = observer(props => {
  const isWeb = Platform.OS === 'web'
  const m = () => ({
    observable: {
      profile: {
        ...profileStore.genEmptyProfile(),
        ...cloneDeep(props.updatingProfile),
      },
      addingPark: '',
    },
    resetAllFields: () => {
      RnAlert.prompt({
        title: intl`Reset`,
        message: intl`Do you want to reset the form to the original data?`,
        onConfirm: () => {
          $.set('profile', (p: Profile) => ({
            ...profileStore.genEmptyProfile(),
            ...cloneDeep(props.updatingProfile),
            id: p.id,
          }))
        },
        confirmText: intl`RESET`,
      })
    },
    //
    onAddingParkSubmit: () => {
      $.set('profile', (p: Profile) => {
        $.addingPark = $.addingPark.trim()
        if ($.addingPark) {
          p.parks.push($.addingPark)
          $.addingPark = ''
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
              Park {i + 1}: {$.profile.parks[i]}
            </RnText>
            <View />
            <RnText>{intl`Do you want to remove this park?`}</RnText>
          </>
        ),
        onConfirm: () => {
          $.set('profile', (p: Profile) => {
            p.parks = p.parks.filter((_, _i) => _i !== i)
            return p
          })
        },
      })
    },
    //
    hasUnsavedChanges: () => {
      const p = props.updatingProfile || profileStore.genEmptyProfile()
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
      props.onSave($.profile, $.hasUnsavedChanges())
    },
  })
  type M0 = ReturnType<typeof m>
  type M = Omit<M0, 'observable'> &
    M0['observable'] &
    ReturnType<typeof useStore>
  const $ = (useStore(m) as any) as M
  const [Form, submitForm] = useForm()
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
              ...(getAuthStore().isConnFailure
                ? [
                    {
                      label: intl`Reconnect to server`,
                      onPress: getAuthStore()
                        .reconnectWithUcLoginFromAnotherPlace,
                    },
                  ]
                : []),
              {
                label: intl`Logout`,
                onPress: getAuthStore().signOut,
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
          {
            disabled: props.footerLogout,
            type: 'Switch',
            name: 'pushNotificationEnabled',
            label: intl`PUSH NOTIFICATION`,
            hidden: isWeb,
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
              $.set('profile', (p: Profile) => {
                p.ucEnabled = v
                return p
              })
            },
          },
          {
            isGroup: true,
            label: intl`PARKS (${$.profile.parks.length})`,
            hasMargin: true,
          },
          ...$.profile.parks.map((p, i) => ({
            disabled: true,
            name: `parks[${i}]`,
            value: p,
            label: intl`PARK ${i + 1}`,
            onRemoveBtnPress: props.footerLogout
              ? null
              : () => $.onAddingParkRemove(i),
          })),
          ...(props.footerLogout
            ? []
            : [
                {
                  name: 'parks[new]',
                  label: intl`NEW PARK`,
                  value: $.addingPark,
                  onValueChange: (v: string) => $.set('addingPark', v),
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

export default ProfileCreateForm
