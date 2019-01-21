import React, {Component} from 'react'
import {createModelView} from '@thenewvu/redux-model'
import UI from './ui'
import UserLanguage from "../../language/UserLanguage"
import { Text, Platform, AsyncStorage, AppState } from 'react-native';
import FCM, {FCMEvent, WillPresentNotificationResult, NotificationType } from "react-native-fcm";

let PROFILES_MANAGE_VIEW = null;

const isIncoming = (call) => call.incoming && !call.answered

const pushNotifTimeout = 20000 + 15000;

function parseCustomNotification_s( notif ){
    let customNotif = notif.custom_notification;
    if( !customNotif ){
        customNotif = notif;
    }
    if( typeof customNotif == "string" ){
        customNotif = JSON.parse( customNotif );
    }

    const currentTime = new Date().getTime();
    const expire = currentTime + pushNotifTimeout;
    customNotif["brekekephone.notif.expire"] = expire;
    return customNotif;
}

function registerFcmKilledListener(){
    this._shutodownNotificationListener = FCM.on(FCMEvent.Notification, notif => {
        const oCustomNotif = parseCustomNotification_s(notif);
        // to check in componentDidMount see app/CodePushApp.js
        //    and app/push-notification/isWakeupByPush.js
        FCM.wakeupByPush = true;
        if( notif.opened_from_tray ){
            setTimeout(()=>{
                PROFILES_MANAGE_VIEW._onOpenCustomNotification(oCustomNotif);
            }, 500)
        }
        else{
            AsyncStorage.setItem('lastNotification', JSON.stringify(oCustomNotif));
        }
    });
}


function registerFcmAppListener(){
    this._foreOrBackgroundNotificationListener = FCM.on(FCMEvent.Notification, notif => {
        if(AppState.currentState !== 'background') {
            return;
        }

        if(Platform.OS ==='ios' && notif._notificationType === NotificationType.WillPresent && !notif.local_notification){
            notif.finish(WillPresentNotificationResult.All)
            return;
        }

        if( notif.opened_from_tray ) {
            setTimeout(() => {
                PROFILES_MANAGE_VIEW._onOpenNotification(notif);
            }, 500)
        }

    });

}

const mapGetter = (getter) => (state, props ) => (
    {
        profileIds: getter.profiles.idsByOrder(state),
        profileById: getter.profiles.detailMapById(state),
        pushNotifies: getter.pushNotifies.notifDatas(state),
        callIds: getter.runningCalls.idsByOrder(state).filter((id) =>
            isIncoming(getter.runningCalls.detailMapById(state)[id])
        ),
        callById: getter.runningCalls.detailMapById(state)
    }
);

const mapAction = (action) => (emit) => ({
    routeToProfilesCreate () {
        emit(action.router.goToProfilesCreate())
    },

    removeProfile (id) {
        emit(action.profiles.remove(id))
    },

    routeToProfileUpdate (id) {
        emit(action.router.goToProfileUpdate(id))
    },

    routeToProfileSignin (id) {
        emit(action.router.goToProfileSignin(id))
    },

    setAuthProfile (profile) {
        emit(action.auth.setProfile(profile))
    },

    routeToAuth () {
        emit(action.router.goToAuth())
    },

    updateCall (call) {
        emit(action.runningCalls.update(call))
    },

    addPushnotif( notif ){
        emit(action.pushNotifies.add( notif ) );
    }

});

class View extends Component {
    constructor(props) {
        super(props);
        if (Platform.OS === 'android') {
            registerFcmKilledListener.call(this);
        }
    }

    _onOpenNotification( notif ){
        AsyncStorage.removeItem('lastNotification');

        const oCustomNotif = parseCustomNotification_s(notif);
        this._onOpenCustomNotification(oCustomNotif);

    }

    _onOpenCustomNotification( oCustomNotif ){
        AsyncStorage.removeItem('lastNotification');
        this.props.addPushnotif(oCustomNotif);
        this._signinByNotif(oCustomNotif);

    }


    componentWillUnmount() {
        if( this._foreOrBackgroundNotificationListener ) {
            this._foreOrBackgroundNotificationListener.remove();
        }
        if( this._shutodownNotificationListener ) {
            this._shutodownNotificationListener.remove();
        }
    }
    async componentWillMount() {

        PROFILES_MANAGE_VIEW = this;
        this.setState({isReady: false})

        await UserLanguage.init_s();

        await AsyncStorage.getItem('lastNotification').then(sData => {
            if(sData){
                const customNotif = JSON.parse(sData);

                const currentTime = new Date().getTime();
                const expire = customNotif["brekekephone.notif.expire"];
                const bTimeout = currentTime > expire;

                if (bTimeout) {
                    AsyncStorage.removeItem('lastNotification');
                }
                else{
                    PROFILES_MANAGE_VIEW._onOpenCustomNotification(customNotif);
                }

            }
        })

        this.setState({isReady: true});
    }

    async componentDidMount() {
        if (Platform.OS === 'android') {
            FCM.createNotificationChannel({
                id: 'default',
                name: 'Default',
                description: 'used for example',
                priority: 'high'
            })
            registerFcmAppListener.call(this);
            FCM.getInitialNotification().then(notif => {
            });

            try {
                await FCM.requestPermissions({
                    badge: false,
                    sound: true,
                    alert: true
                });
            } catch (e) {
                console.error(e);
            }

            FCM.getFCMToken().then(token => {
                this.setState({token: token || ""});
            });
        }

    }

    _getUidByCustomNotif( notif ){
        const nPbxTenant = notif.tenant;
        const nPbxUsername = notif.to;
        const nPbxPort = notif.pbxPort;
        const nPbxHostname = notif.pbxHostname;

        const nIsPbxUsernameEmpty =  !nPbxUsername || nPbxUsername.length === 0;
        const nIsPbxTenantEmpty =  !nPbxTenant || nPbxTenant.length === 0;
        const nIsPbxPortEmpty =  !nPbxPort || nPbxPort.length === 0;
        const nIsPbxHostnameEmpty =  !nPbxHostname || nPbxHostname.length === 0;

        const profiles = this.props.profileById;
        const uids = Object.keys( profiles );
        for( let i = 0; i < uids.length; i++ ) {

            const uid = uids[i];
            const profile = profiles[uid];
            const pPbxUsername = profile.pbxUsername;

            if( !nIsPbxUsernameEmpty ){
                if( nPbxUsername !== pPbxUsername ){
                    continue;
                }
            }

            const pPbxTenant = profile.pbxTenant;
            if( !nIsPbxTenantEmpty ){
                if( nPbxTenant !== pPbxTenant ){
                    continue;
                }
            }

            const pPbxHostname = profile.pbxHostname;
            if( !nIsPbxHostnameEmpty ){
                if( nPbxHostname !== pPbxHostname ){
                    continue;
                }
            }

            const pPbxPort = profile.pbxPort;
            if( !nIsPbxPortEmpty ){
                if( nPbxPort !== pPbxPort ){
                    continue;
                }
            }

            return uid;

        }

        return null;

    }

    _signinByNotif( customNotif ){
        const uid = this._getUidByCustomNotif( customNotif );
        if( !uid ){
            return;
        }
        this.signin(uid);
    }

    render() {
        if ( !this.state || this.state.isReady !== true ) {
            return <Text></Text>
        }

        return <UI
            profileIds={this.props.profileIds}
            resolveProfile={this.resolveProfile}
            create={this.props.routeToProfilesCreate}
            update={this.props.routeToProfileUpdate}
            signin={this.signin}
            remove={this.props.removeProfile}
        />
    }

    resolveProfile = (id) => (
        this.props.profileById[id]
    )


    signin = (id) => {
        let profile = this.resolveProfile(id)
        this.props.setAuthProfile(profile);
        this.props.routeToAuth();
    }
}

export default
createModelView(mapGetter, mapAction)(View)

// To get the PROFILES_MANAGE_VIEW to use in apns handlers
export const getProfileManager = () => PROFILES_MANAGE_VIEW;
