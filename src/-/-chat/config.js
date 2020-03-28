import moment from 'moment';

import uc from '../api/uc';
import intl from '../intl/intl';

export const numberOfChatsPerLoad = 20;

export const groupByTimestamp = arr => {
  const me = uc.me();
  const groupByDate = [];
  if (!arr?.length) {
    return groupByDate;
  }
  let lastDate = null;
  let groupByTime = null;
  let lastMessage = null;
  let messages = null;
  const d = moment();
  const today = d.format('MMM D');
  const yesterday = d.add(-1, 'days').format('MMM D');
  arr.forEach(m => {
    const d = moment(m.created);
    const date = d.format('MMM D');
    if (!lastDate || date !== lastDate) {
      groupByTime = [];
      lastDate = date;
      groupByDate.push({
        date:
          date === today
            ? intl`Today`
            : date === yesterday
            ? intl`Yesterday`
            : date,
        groupByTime,
      });
    }
    if (
      !lastMessage ||
      m.creator !== lastMessage.creator ||
      moment(m.created).valueOf() - moment(lastMessage.created).valueOf() >
        10 * 60000
    ) {
      const time = d.format('HH:mm');
      lastMessage = m;
      messages = [];
      groupByTime.push({
        time,
        messages,
        createdByMe: m.creator === me.id,
      });
    }
    messages.push(m);
  });
  return groupByDate;
};
