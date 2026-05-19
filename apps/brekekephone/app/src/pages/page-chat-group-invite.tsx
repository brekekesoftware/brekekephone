import { observer } from 'mobx-react'
import { Component } from 'react'
import { View } from 'react-native'
import { UserItem } from '#/components/contact-user-item'
import { Field } from '#/components/field'
import { Layout } from '#/components/layout'
import { RnText, RnTouchableOpacity } from '#/components/rn'
import { v } from '#/components/variables'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'

const css = {
  PageChatGroupInvite: {},
  PageChatGroupInvite_TextInput: {
    padding: 10,
    ...v.boxShadow,
  },
  PageChatGroupInvite_Outer: {
    paddingTop: 5,
    paddingHorizontal: 10,
  },
  PageChatGroupInvite_BtnSave: {
    marginTop: 15,
    padding: 10,
    borderRadius: v.borderRadius,
    backgroundColor: v.colors.primary,
  },
  PageChatGroupInvite_BtnText: {
    alignItems: 'center',
    color: 'white',
    fontSize: v.fontSizeSubTitle,
  },
  PageChatGroupInvite_GroupName: {
    fontSize: v.fontSizeTitle,
    padding: 5,
  },
  PageChatGroupInvite_Text: {
    paddingTop: 15,
    fontSize: v.fontSizeTitle,
  },
}

@observer
export class PageChatGroupInvite extends Component<{
  groupId: string
}> {
  state = {
    selectedBuddy: {} as { [k: string]: boolean },
  }

  render() {
    return (
      <Layout onBack={this.back} title={intl`Inviting Group Member`}>
        <View style={css.PageChatGroupInvite_Outer}>
          <RnText className='p-1.25 text-[25.2px]'>
            {ctx.chat.getGroupById(this.props.groupId).name}
          </RnText>
          <RnTouchableOpacity
            onPress={this.invite}
            style={css.PageChatGroupInvite_BtnSave}
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
}
