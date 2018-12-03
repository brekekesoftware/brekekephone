import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {createModelView} from '@thenewvu/redux-model'
import UI from './ui'
import createID from "shortid";

const isIncoming = (call) => call.incoming && !call.answered

const mapGetter = (getter) => (state) => ({
  callIds: getter.runningCalls.idsByOrder(state).filter((id) =>
    isIncoming(getter.runningCalls.detailMapById(state)[id])
  ),
  callById: getter.runningCalls.detailMapById(state),
    pushNotifies: getter.pushNotifies.notifDatas(state)
})

const mapAction = (action) => (emit) => ({
    removeNotif (notifData) {
        emit(action.pushNotifies.remove(notifData));
    },
    routeToProfilesManage () {
        emit(action.router.goToProfilesManage())
    },
    showToast (message) {
        emit(action.toasts.create({id: createID(), message}))
    }
})

class View extends Component {
    static contextTypes = {
        sip: PropTypes.object.isRequired
    }

    _findCallByCustomNotifData( data ){
        const nPartyNumber = data.from;
        const nPbxUsername = data.to;
        const nIsPbxUsernameEmpty = !nPbxUsername || nPbxUsername.length === 0;
        const nPbxTenant = data.tenant;
        const nIsPbxTenantEmpty = !nPbxTenant || nPbxTenant.length === 0;

        for( let k = 0; k < this.props.callIds.length; k++ ) {
            const callid = this.props.callIds[k];
            const call = this.resolveCall(callid);

            if( call.incoming !== true || call.answered !== false ){
                continue;
            }

            const cPbxUsername = call.pbxUsername;
            if( !nIsPbxUsernameEmpty ){
                if( cPbxUsername ){
                    if( nPbxUsername !== cPbxUsername ){
                        continue;
                    }
                }
                else{
                    if( nPartyNumber !== call.partyNumber ){
                        continue;
                    }
                }
            }

            const cPbxTenant = call.pbxTenant;
            if( !nIsPbxTenantEmpty ){
                if( nPbxTenant !== cPbxTenant ){
                    continue;
                }
            }

            return call;
        }

        return null;

    }

  componentDidUpdate(){
      for( let i = 0; i < this.props.pushNotifies.length; i++ ){
         const data = this.props.pushNotifies[i];
         const call = this._findCallByCustomNotifData(data);
         if( call ){
             this.accept( call.id );
            this.props.removeNotif(data);
         }
         else{
             const expire = data["brekekephone.notif.expire"];
             const currentTime = new Date().getTime();
             if (currentTime > expire ) {
                 this.props.removeNotif(data);
             }

         }

      }

  }

    render = () => <UI
        callIds={this.props.callIds}
        resolveCall={this.resolveCall}
        accept={this.accept}
        reject={this.reject}
    />

    resolveCall = (id) => {
        const call = this.props.callById[id];
        return call;
    }

    reject = (id) => {
        const {sip} = this.context
        sip.hangupSession(id)
    }

    accept = (id) => {
        const {sip} = this.context
        const call = this.props.callById[id]
        const videoEnabled = call.remoteVideoEnabled
        sip.answerSession(id, {videoEnabled})
    }
}

export default
createModelView(mapGetter,mapAction)(View)
