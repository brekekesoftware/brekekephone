import { View } from '@rntwsc/rn/core/components/view'
import { tw } from '@rntwsc/rn/core/tw/tw'
import { observer } from 'mobx-react'
import { useEffect, useRef, useState } from 'react'

import {
  mdiArrowRight,
  mdiPhoneForward,
  mdiPhoneHangup,
  mdiPhoneOff,
} from '#/assets/icons'
import { Avatar } from '#/components/avatar'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/rn'
import { getPbxName } from '#/stores/contact-store'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'

const innerCls = tw`web:max-w-100 web:min-w-62.5 web:justify-between justify-center`

export const PageCallTransferAttend = observer(() => {
  const prevIdRef = useRef<string | undefined>(undefined)
  const mountedRef = useRef(true)

  const [phoneappliSource, setPhoneappliSource] = useState({
    avatar: '',
    username: '',
  })
  const [phoneappliTarget, setPhoneappliTarget] = useState({
    avatar: '',
    username: '',
  })

  const getPhoneappliInfo = async () => {
    if (!ctx.auth.phoneappliEnabled()) {
      return
    }
    const oc = ctx.call.getOngoingCall()
    if (!oc) {
      return
    }
    try {
      const ca = ctx.auth.getCurrentAccount()
      if (!ca) {
        return
      }
      const { pbxTenant, pbxUsername } = ca
      const rs = await ctx.pbx.getPhoneappliContact(
        pbxTenant,
        pbxUsername,
        oc.partyNumber,
      )
      if (!mountedRef.current) {
        return
      }
      const src = {
        avatar: rs?.image_url || '',
        username: rs?.display_name || '',
      }
      const rt = await ctx.pbx.getPhoneappliContact(
        pbxTenant,
        pbxUsername,
        oc.transferring,
      )
      if (!mountedRef.current) {
        return
      }
      const tgt = {
        avatar: rt?.image_url || '',
        username: rt?.display_name || '',
      }
      setPhoneappliSource(src)
      setPhoneappliTarget(tgt)
    } catch (err) {
      console.error(err)
      return
    }
  }

  const ocId = ctx.call.getOngoingCall()?.id
  useEffect(() => {
    if (prevIdRef.current && prevIdRef.current !== ocId) {
      ctx.nav.backToPageCallManage()
    }
    prevIdRef.current = ocId
  }, [ocId])

  useEffect(() => {
    mountedRef.current = true
    getPhoneappliInfo()
    return () => {
      mountedRef.current = false
    }
  }, [])

  const resolveMatch = (id: string) => {
    const ucUser = ctx.contact.getUcUserById(id) || {}
    return {
      avatar: ucUser.avatar,
      number: id,
    }
  }

  const oc = ctx.call.getOngoingCall()
  if (!oc) {
    return null
  }
  const usersource = resolveMatch(oc.partyNumber)
  const usertarget = resolveMatch(oc.transferring)
  return (
    <View className='bg-background web:w-full web:h-full flex-1 items-center justify-center'>
      <RnText center subTitle>{intl`Transferring`}</RnText>
      <View className='h-2.5' />
      <View
        className={[
          'mb-7.5 w-[70%] flex-row content-center items-center self-center',
          innerCls,
        ]}
      >
        <View className='flex-5 flex-col items-center justify-center'>
          <Avatar
            source={{
              uri: phoneappliSource.avatar || usersource?.avatar,
            }}
          />
          <RnText center singleLine small>
            {phoneappliSource.username || oc.getDisplayName()}
          </RnText>
        </View>
        <View className='flex-1'>
          <RnIcon path={mdiArrowRight} className='text-foreground' />
        </View>
        <View className='flex-5 flex-col items-center justify-center'>
          <Avatar
            source={{
              uri: phoneappliTarget.avatar || usertarget?.avatar,
            }}
          />
          <RnText center singleLine small>
            {phoneappliTarget.username ||
              getPbxName({
                partyNumber: oc.transferring,
              }) ||
              oc.transferring}
          </RnText>
        </View>
      </View>
      <View className='h-2.5' />
      <View
        className={[
          'mb-7.5 w-[70%] flex-row content-center items-center self-center',
          innerCls,
        ]}
      >
        <View className='w-[33.333%] items-center'>
          <RnTouchableOpacity
            onPress={() => {
              oc.stopTransferring()
              ctx.nav.backToPageCallManage()
            }}
            className='bg-warning h-12.5 w-12.5 rounded-full'
          >
            <RnIcon path={mdiPhoneOff} />
          </RnTouchableOpacity>
          <RnText center singleLine small>
            {intl`CANCEL`}
          </RnText>
        </View>
        <View className='w-[33.333%] items-center'>
          <RnTouchableOpacity
            onPress={() => ctx.sip.hangupSession(oc.id)}
            className='bg-error h-12.5 w-12.5 rounded-full'
          >
            <RnIcon path={mdiPhoneHangup} />
          </RnTouchableOpacity>
          <RnText center singleLine small>
            {intl`TRANSFER`}
          </RnText>
        </View>
        <View className='w-[33.333%] items-center'>
          <RnTouchableOpacity
            onPress={() => {
              oc.conferenceTransferring()
              ctx.nav.backToPageCallManage()
            }}
            className='bg-primary h-12.5 w-12.5 rounded-full'
          >
            <RnIcon path={mdiPhoneForward} />
          </RnTouchableOpacity>
          <RnText center singleLine small>
            {intl`CONFERENCE`}
          </RnText>
        </View>
      </View>
    </View>
  )
})
