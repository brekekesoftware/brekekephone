import { observer } from 'mobx-react'
import { useState } from 'react'

import { View } from '@/rn/core/components/view'
import { UserItem } from '#/components/contact-user-item'
import { Field } from '#/components/field'
import { Layout } from '#/components/layout'
import { RnText, RnTouchableOpacity } from '#/components/rn'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'

export const PageChatGroupInvite = observer(({ groupId }: { groupId: string }) => {
  const [selectedBuddy, setSelectedBuddy] = useState<{ [k: string]: boolean }>({})

  const isNotMember = (buddy: string) =>
    !ctx.chat.getGroupById(groupId).members?.includes(buddy)
  const resolveBuddy = (buddy: string) => ctx.contact.getUcUserById(buddy)
  const toggleBuddy = (buddy: string) => {
    setSelectedBuddy({
      ...selectedBuddy,
      [buddy]: !selectedBuddy[buddy],
    })
  }
  const back = () => {
    ctx.nav.backToPageChatGroupDetail({ groupId })
  }
  const onInviteFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to invite group chat`,
      err,
    })
  }
  const invite = () => {
    const members = Object.keys(selectedBuddy)
    if (!members.length) {
      RnAlert.error({
        message: intlDebug`No buddy selected`,
      })
      return
    }
    ctx.uc
      .inviteChatGroupMembers(groupId, members)
      .catch(onInviteFailure)
      .then(back)
  }

  return (
    <Layout onBack={back} title={intl`Inviting Group Member`}>
      <View className='px-2.5 pt-1.25'>
        <RnText className='p-1.25 text-[25.2px]'>
          {ctx.chat.getGroupById(groupId).name}
        </RnText>
        <RnTouchableOpacity
          onPress={invite}
          className='bg-primary rounded-button mt-3.75 p-2.5'
        >
          <RnText
            white
            className='items-center text-[16.8px]'
          >{intl`Invite`}</RnText>
        </RnTouchableOpacity>
        <RnText className='pt-3.75 text-[25.2px]'>{intl`Members`}</RnText>
      </View>
      <Field isGroup />
      {ctx.contact.ucUsers
        .map(u => u.id)
        .filter(isNotMember)
        .map((id, i) => (
          <RnTouchableOpacity key={i} onPress={() => toggleBuddy(id)}>
            <UserItem
              key={id}
              {...resolveBuddy(id)}
              selected={selectedBuddy[id]}
            />
          </RnTouchableOpacity>
        ))}
    </Layout>
  )
})
