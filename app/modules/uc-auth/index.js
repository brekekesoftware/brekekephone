import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {createModelView} from '@thenewvu/redux-model'
import createID from 'shortid'
import UI from './ui'
import {UC_CONNECT_STATES} from "./uc-connect-state"
import UCClient from '../../apis/ucclient'

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

    constructor(props){
        super(props)
        this.state = { connectState: UC_CONNECT_STATES.NONE, didPleonasticLogin: false };

        const this_ = this;
        this._onUCConnectionStoppedForCallback = function (ev) {
            this_._onUCConnectionStopped(ev);
        };
    }

    _setStateForLifecycle( connectState, didPleonasticLogin){
        this._connectState = connectState;
        this._didPleonasticLogin = didPleonasticLogin;
        this.setState( {connectState: connectState, didPleonasticLogin: didPleonasticLogin} );
    }

    _setConnectStateForLifecycle( connectState ){
        this._setStateForLifecycle( connectState, this._didPleonasticLogin );
    }

    render () {
        const connectState = this._connectState;

        if( connectState === UC_CONNECT_STATES.CONNECTED || !this.props.enabled ){
            return null;
        }
        return <UI
            failure={this.props.failure}
            abort={this.props.routToProfilesManage}
            retry={this.auth}
            connectState={connectState}
        />
    }

    componentDidMount () {
        this._setStateForLifecycle( UC_CONNECT_STATES.NONE, false );

        const {uc} = this.context;
        uc.on('connection-stopped', this._onUCConnectionStoppedForCallback );

        if (this.needToAutoAuth()) {
            this.auth()
        }
    }

    componentDidUpdate () {
        if (this.needToAutoAuth()) {
            this.auth()
        }
    }

    componentWillUnmount () {
        const {uc} = this.context
        uc.off('connection-stopped', this._onUCConnectionStoppedForCallback)

        this.context.uc.disconnect();
        this._setStateForLifecycle( UC_CONNECT_STATES.NONE, false );

        this.props.onStopped()
        this.props.reinitBuddyChats()
        this.props.clearAllGroupChats()
        this.props.clearAllChatGroups()
    }

    needToAutoAuth () {
        if( !this.props.profile || !this.props.enabled ){
            return false;
        }

        if( this._connectState !== UC_CONNECT_STATES.NONE ) {
            return false;
        }

        return true;
    }

    auth = () => {
        const {uc} = this.context
        uc.disconnect()

        this.props.onStarted()
        this._setConnectStateForLifecycle(UC_CONNECT_STATES.CONNECTING);

        let option = undefined;
        if( this._didPleonasticLogin === true ){
            option = { modest : true };
        }

        uc.connect(this.props.profile, option )
            .then(this.onAuthSuccess)
            .catch(this.onAuthFailure)

    }

    onAuthSuccess = () => {
        this.props.onSuccess()
        this.loadUsers()
        this.loadUnreadChats();
        this._setConnectStateForLifecycle(UC_CONNECT_STATES.CONNECTED);
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
        let didPleonasticLogin = this._didPleonasticLogin;
        if (err) {
            if( err.message ) {
                this.props.showToast(err.message)
            }
            if( err.code === UCClient.Errors.ALREADY_SIGNED_IN ){
                didPleonasticLogin = false;
            }
        }
        this.props.onFailure()
        this._setStateForLifecycle(UC_CONNECT_STATES.CONNECT_FAILED, didPleonasticLogin );

    }

    _onUCConnectionStopped(ev){
        const didPleonasticLogin = ev.code === UCClient.Errors.PLEONASTIC_LOGIN;

        this._setStateForLifecycle(UC_CONNECT_STATES.NONE, didPleonasticLogin );

    }

}

export default
createModelView(mapGetter, mapAction)(View)
