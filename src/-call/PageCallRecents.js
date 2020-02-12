import { mdiMagnify, mdiPhone, mdiVideo } from '@mdi/js';
import { observer } from 'mobx-react';
import moment from 'moment';
import React from 'react';

import UserItem from '../-contact/UserItem';
import sip from '../api/sip';
import g from '../global';
import authStore from '../global/authStore';
import callStore from '../global/callStore';
import contactStore from '../global/contactStore';
import intl from '../intl/intl';
import Field from '../shared/Field';
import Layout from '../shared/Layout';

@observer
class PageCallRecents extends React.Component {
  isMatchUser = call => {
    if (call.partyNumber.includes(contactStore.callSearchRecents)) {
      return call.id;
    }
  };

  callVoice = userId => {
    sip.createSession(userId);
    g.goToPageCallManage();
  };
  callVideo = userId => {
    sip.createSession(userId, {
      videoEnabled: true,
    });
    g.goToPageCallManage();
  };

  getAvatar = id => {
    const ucUser = contactStore.getUCUser(id) || {};
    return {
      id: id,
      avatar: ucUser.avatar,
    };
  };
  getMatchedCalls = () => {
    const calls =
      authStore.currentProfile.recentCalls?.filter(this.isMatchUser) || [];
    // Backward compatibility to remove invalid items from the previous versions
    const filteredCalls = calls.filter(
      c =>
        typeof c.created === `string` &&
        // HH:mm - MMM D
        (c.created.length === 13 || c.created.length === 14),
    );
    if (calls.length !== filteredCalls.length) {
      // Use setTimeout to update observable after rendering
      setTimeout(() => {
        g.upsertProfile({
          id: authStore.signedInId,
          recentCalls: filteredCalls,
        });
      });
    }
    //
    const today = moment().format(`MMM D`);
    return filteredCalls.map(c => ({
      ...c,
      created: c.created.replace(` - ${today}`, ``),
    }));
  };

  render() {
    const calls = this.getMatchedCalls();
    return (
      <Layout
        description={intl`Recent voicemails and calls`}
        menu="call"
        subMenu="recents"
        title={intl`Recents`}
      >
        <Field
          icon={mdiMagnify}
          label={intl`SEARCH NAME, PHONE NUMBER ...`}
          onValueChange={v => {
            contactStore.callSearchRecents = v;
          }}
          value={contactStore.callSearchRecents}
        />
        <Field
          isGroup
          label={intl`VOICEMAILS (${callStore.newVoicemailCount})`}
        />
        <Field isGroup label={intl`RECENT CALLS (${calls.length})`} />
        {calls.map((c, i) => (
          <UserItem
            iconFuncs={[
              () => this.callVideo(c.partyNumber),
              () => this.callVoice(c.partyNumber),
            ]}
            icons={[mdiVideo, mdiPhone]}
            isRecentCall
            key={i}
            {...this.getAvatar(c.partyNumber)}
            {...c}
          />
        ))}
      </Layout>
    );
  }
}

export default PageCallRecents;
