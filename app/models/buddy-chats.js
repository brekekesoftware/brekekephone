import { createModel } from '@thenewvu/redux-model';
import immutable from '@thenewvu/immutable';
import pickProps from 'lodash.pick';

const allowedChatProps = ['id', 'created', 'text', 'file', 'creator'];
const validateChat = chat => pickProps(chat, allowedChatProps);
const uniqArray = arr => Array.from(new Set(arr));
const reduceChatsToMapById = chats =>
  chats.reduce((res, cur) => ({ ...res, [cur.id]: cur }), {});
const mapChatsToIds = chats => chats.map(({ id }) => id);

export default createModel({
  prefix: 'buddyChats',
  origin: {
    buddyIdsByRecent: [],
    idsMapByBuddy: {},
    detailMapById: {},
  },
  getter: {
    buddyIdsByRecent: state => state.buddyIdsByRecent,
    idsMapByBuddy: state => state.idsMapByBuddy,
    detailMapById: state => state.detailMapById,
  },
  action: {
    clearAll: () => ({
      buddyIdsByRecent: [],
      idsMapByBuddy: {},
      detailMapById: {},
    }),
    appendByBuddy: (s, buddy, chats) =>
      immutable.on(s)(
        immutable.fset('buddyIdsByRecent', ids => uniqArray([buddy, ...ids])),
        immutable.fset('detailMapById', map => ({
          ...map,
          ...reduceChatsToMapById(chats.map(validateChat)),
        })),
        immutable.fset(`idsMapByBuddy.${buddy}`, (ids = []) => [
          ...ids,
          ...mapChatsToIds(chats),
        ]),
      ),
    prependByBuddy: (s, buddy, chats) =>
      immutable.on(s)(
        immutable.fset('buddyIdsByRecent', ids => uniqArray([buddy, ...ids])),
        immutable.fset('detailMapById', map => ({
          ...map,
          ...reduceChatsToMapById(chats.map(validateChat)),
        })),
        immutable.fset(`idsMapByBuddy.${buddy}`, (ids = []) => [
          ...mapChatsToIds(chats),
          ...ids,
        ]),
      ),
  },
});
