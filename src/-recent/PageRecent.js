import { mdiPhone } from '@mdi/js';
import { observer } from 'mobx-react';
import React from 'react';

import authStore from '../-/authStore';
import contactStore from '../-/contactStore';
import g from '../global';
import Item from '../shared/ItemUser';
import Layout from '../shared/Layout';
import Search from '../shared/Search';

const monthName = [
  `Jan`,
  `Feb`,
  `Mar`,
  `Apr`,
  `May`,
  `Jun`,
  `Jul`,
  `Aug`,
  `Sep`,
  `Oct`,
  `Nov`,
  `Dec`,
];

const formatTime = time => {
  time = new Date(time);
  const month = monthName[time.getMonth()];
  const day = time.getDate();
  const hour = time
    .getHours()
    .toString()
    .padStart(2, `0`);
  const min = time
    .getMinutes()
    .toString()
    .padStart(2, `0`);
  return `${month} ${day} - ${hour}:${min}`;
};

@observer
class Recent extends React.Component {
  isMatchUser = call => {
    if (call.partyNumber.includes(contactStore.searchText)) {
      return call.id;
    }
  };

  callBack = id => {
    const number = authStore.profile.recentCalls?.find(c => c.id === id)
      ?.partyNumber;
    if (number) {
      this.context.sip.createSession(number);
      g.goToCallsManage();
    } else {
      g.showError({ message: `Could not find number from store to call` });
    }
  };

  getMatchUserIds = () =>
    authStore.profile.recentCalls.filter(this.isMatchUser).map(c => c.id);

  render() {
    const users = this.getMatchUserIds();

    return (
      <Layout
        header={{
          title: `Recent`,
        }}
      >
        <Search />
        <React.Fragment>
          {users.length !== 0 &&
            users.map((u, i) => (
              <Item
                last={i === users.length - 1}
                icon={[mdiPhone]}
                function={[() => this.callBack(u.id)]}
                detail={true}
                formatTime={formatTime}
                {...u}
              />
            ))}
        </React.Fragment>
      </Layout>
    );
  }
}

export default Recent;
