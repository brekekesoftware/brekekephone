import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {createModelView} from '@thenewvu/redux-model'
import createID from 'shortid'
import UI from './ui'

const mapGetter = (getter) => (state) => {
  const profile = getter.auth.profile(state)

  if (!profile) {
    return {enabled: false}
  }

  return {
    enabled: profile.ucEnabled,
    started: getter.auth.uc.started(state),
    stopped: getter.auth.uc.stopped(state),
    success: getter.auth.uc.success(state),
    failure: getter.auth.uc.failure(state),
    profile: {
      hostname: profile.ucHostname,
      port: profile.ucPort,
      tenant: profile.pbxTenant,
      username: profile.pbxUsername,
      password: profile.pbxPassword
    }
  }
}

const mapAction = (action) => (emit) => ({
  onStarted () {
    emit(action.auth.uc.onStarted())
  },
  onSuccess () {
    emit(action.auth.uc.onSuccess())
  },
  onFailure () {
    emit(action.auth.uc.onFailure())
  },
  onStopped () {
    emit(action.auth.uc.onStopped())
  },
  fillUsers (users) {
    emit(action.ucUsers.refill(users))
  },
  routToProfilesManage () {
    emit(action.router.goToProfilesManage())
  },
  showToast (message) {
    emit(action.toasts.create({id: createID(), message}))
  },
  appendBuddyChats (buddy, chats) {
    emit(action.buddyChats.appendByBuddy(buddy, chats))
  },
  reinitBuddyChats () {
    emit(action.buddyChats.clearAll())
  },
  clearAllGroupChats () {
    emit(action.groupChats.clearAll())
  },
  clearAllChatGroups () {
    emit(action.chatGroups.clearAll())
  }
})

class View extends Component {
  static contextTypes = {
    uc: PropTypes.object.isRequired
  }

  render () {
    if (this.props.success ||
       !this.props.enabled
    ) {
      return null
    }
    return <UI
      failure={this.props.failure}
      abort={this.props.routToProfilesManage}
      retry={this.auth}
    />
  }

  componentDidMount () {
    if (this.needToAuth()) {
      this.auth()
    }
  }

  componentDidUpdate () {
    if (this.needToAuth()) {
      this.auth()
    }
  }

  componentWillUnmount () {
    this.context.uc.disconnect();
    this.props.onStopped()
    this.props.reinitBuddyChats()
    this.props.clearAllGroupChats()
    this.props.clearAllChatGroups()
  }

  needToAuth () {
    return this.props.profile &&
           this.props.enabled &&
          !this.props.started &&
          !this.props.success &&
          !this.props.failure
  }

  auth = () => {
    const {uc} = this.context

    uc.disconnect()
    this.props.onStarted()

    uc.connect(this.props.profile)
      .then(this.onAuthSuccess)
      .catch(this.onAuthFailure)
  }

  onAuthSuccess = () => {
    this.props.onSuccess()
    this.loadUsers()
    this.loadUnreadChats();

  }

  loadUsers () {
    const {uc} = this.context
    const users = uc.getUsers()
    this.props.fillUsers(users)
  }

  loadUnreadChats () {
    const {uc} = this.context
    uc.getUnreadChats()
      .then(this.onLoadUnreadChatsSuccess)
      .catch(this.onLoadUnreadChatsFailure)
  }

  onLoadUnreadChatsSuccess = (chats) => {
    const {appendBuddyChats} = this.props
    chats.forEach((chat) => {
      appendBuddyChats(chat.creator, [chat])
    })
  }

  onLoadUnreadChatsFailure = (err) => {
    console.error(err)
    const {showToast} = this.props
    showToast('Failed to load unread chats')
    if (err && err.message) {
      showToast(err.message)
    }
  }

  onAuthFailure = (err) => {
    console.error(err)
    if (err && err.message) {
      this.props.showToast(err.message)
    }
    this.props.onFailure()
  }
}

export default
createModelView(mapGetter, mapAction)(View)
