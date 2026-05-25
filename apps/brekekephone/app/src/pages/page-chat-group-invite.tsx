import { observer } from 'mobx-react'
import { Component } from 'react'

import { View } from '@/rn/core/components/view'
import { UserItem } from '#/components/contact-user-item'
import { Field } from '#/components/field'
import { Layout } from '#/components/layout'
import { RnText, RnTouchableOpacity } from '#/components/rn'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'

export const PageChatGroupInvite = observer(
  class PageChatGroupInvite extends Component<{
    groupId: string
  }> {
    state = {
      selectedBuddy: {} as { [k: string]: boolean },
    }

    render() {
      return (
        <Layout onBack={this.back} title={intl`Inviting Group Member`}>
          <View className='px-2.5 pt-1.25'>
            <RnText className='p-1.25 text-[25.2px]'>
              {ctx.chat.getGroupById(this.props.groupId).name}
            </RnText>
            <RnTouchableOpacity
              onPress={this.invite}
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
            .filter(this.isNotMember)
            .map((id, i) => (
              <RnTouchableOpacity key={i} onPress={() => this.toggleBuddy(id)}>
                <UserItem
                  key={id}
                  {...this.resolveBuddy(id)}
                  selected={this.state.selectedBuddy[id]}
                />
              </RnTouchableOpacity>
            ))}
        </Layout>
      )
    }
    isNotMember = (buddy: string) =>
      !ctx.chat.getGroupById(this.props.groupId).members?.includes(buddy)
    resolveBuddy = (buddy: string) => ctx.contact.getUcUserById(buddy)
    toggleBuddy = (buddy: string) => {
      let { selectedBuddy } = this.state
      selectedBuddy = {
        ...selectedBuddy,
        [buddy]: !selectedBuddy[buddy],
      }
      this.setState({
        selectedBuddy,
      })
    }

    invite = () => {
      const { selectedBuddy } = this.state
      const members = Object.keys(selectedBuddy)
      if (!members.length) {
        RnAlert.error({
          message: intlDebug`No buddy selected`,
        })
        return
      }
      ctx.uc
        .inviteChatGroupMembers(this.props.groupId, members)
        .catch(this.onInviteFailure)
        .then(this.back)
    }
    onInviteFailure = (err: Error) => {
      RnAlert.error({
        message: intlDebug`Failed to invite group chat`,
        err,
      })
    }
    back = () => {
      ctx.nav.backToPageChatGroupDetail({ groupId: this.props.groupId })
    }
  },
)
