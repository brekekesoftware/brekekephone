import { mdiPhone, mdiPhoneMissed } from '@mdi/js';
import { Body, Button, Left, ListItem, Right, Text, View } from 'native-base';
import React from 'react';

import Avatar from '../components-shared/Avatar';
import SvgIcon from '../components-shared/SvgIcon';

const monthName = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const formatTime = time => {
  time = new Date(time);
  const month = monthName[time.getMonth()];
  const day = time.getDate();
  const hour = time
    .getHours()
    .toString()
    .padStart(2, '0');
  const min = time
    .getMinutes()
    .toString()
    .padStart(2, '0');
  return `${month} ${day} - ${hour}:${min}`;
};

class User extends React.Component {
  render() {
    const p = this.props;
    const user = p.resolveUser(p.partyNumber);
    return (
      <ListItem listUser>
        <Left>
          <Avatar
            source={user.avatar}
            online={user.online}
            offline={user.offline}
            busy={user.busy}
          />
        </Left>
        <Body>
          <Text>{p.partyName || p.partyNumber}</Text>

          {p.incoming && p.answered && (
            <View>
              <SvgIcon path={mdiPhoneMissed} />
              <Text note>at {formatTime(p.created)}</Text>
            </View>
          )}
          {p.incoming && !p.answered && (
            <View>
              <SvgIcon path={mdiPhoneMissed} />
              <Text note>Missed at {formatTime(p.created)}</Text>
            </View>
          )}
          {!p.incoming && (
            <View>
              <SvgIcon path={mdiPhoneMissed} />
              <Text note>Outgoing at {formatTime(p.created)}</Text>
            </View>
          )}
        </Body>
        <Right>
          <Button onPress={p.callBack}>
            <SvgIcon path={mdiPhone} />
          </Button>
        </Right>
      </ListItem>
    );
  }
}

export default User;
