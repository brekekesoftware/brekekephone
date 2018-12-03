import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {createModelView} from '@thenewvu/redux-model'
import createID from 'shortid'
import UI from './ui'

const mapGetter = (getter) => (state) => ({
  profile: getter.auth.profile(state)
})

const mapAction = (action) => (emit) => ({
  routeToProfilesManage () {
    emit(action.router.goToProfilesManage())
  },
  showToast (message) {
    emit(action.toasts.create({id: createID(), message}))
  }
})

class View extends Component {
  static contextTypes = {
    uc: PropTypes.object.isRequired
  }

  state = {
    chatMood: false,
    chatOffline: false,
    chatOnline: false,
    chatBusy: false
  }

  componentDidMount () {
    const me = this.context.uc.me()
    this.setState({
      chatMood: me.mood,
      chatOffline: me.offline,
      chatOnline: me.online,
      chatBusy: me.busy
    })
  }

  render = () => <UI
    profile={this.props.profile}
    chatOffline={this.state.chatOffline}
    chatOnline={this.state.chatOnline}
    chatBusy={this.state.chatBusy}
    chatMood={this.state.chatMood}
    setChatOnline={this.setChatOnline}
    setChatOffline={this.setChatOffline}
    setChatBusy={this.setChatBusy}
    setChatMood={this.setChatMood}
    submitChatMood={this.submitChatMood}
    signout={this.props.routeToProfilesManage}
  />

  onSetChatStatusSuccess = () => {
    const me = this.context.uc.me()
    this.setState({
      chatMood: me.mood,
      chatOffline: me.offline,
      chatOnline: me.online,
      chatBusy: me.busy
    })
  }

  onSetChatStatusFailure = () => {
    const {showToast} = this.props
    showToast('Failed to change chat status')
  }

  setChatOffline = () => {
    const {uc} = this.context
    uc.setOffline(this.state.chatMood)
      .then(this.onSetChatStatusSuccess)
      .catch(this.onSetChatStatusFailure)
  }

  setChatOnline = () => {
    const {uc} = this.context
    uc.setOnline(this.state.chatMood)
      .then(this.onSetChatStatusSuccess)
      .catch(this.onSetChatStatusFailure)
  }

  setChatBusy = () => {
    const {uc} = this.context
    uc.setBusy(this.state.chatMood)
      .then(this.onSetChatStatusSuccess)
      .catch(this.onSetChatStatusFailure)
  }

  setChatMood = (chatMood) => {
    this.setState({chatMood})
  }

  submitChatMood = () => {
    const {
      chatOffline,
      chatOnline,
      chatBusy
    } = this.state

    if (chatOffline) {
      this.setChatOffline()
    } else
    if (chatOnline) {
      this.setChatOnline()
    } else
    if (chatBusy) {
      this.setChatBusy()
    }
  }
}

export default
createModelView(mapGetter, mapAction)(View)
