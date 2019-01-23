import { createModel } from '@thenewvu/redux-model';
import immutable from '@thenewvu/immutable';
import pickProps from 'lodash.pick';
import omitProps from 'lodash.omit';

const allowedChatProps = ['id', 'created', 'text', 'file', 'creator'];
const validateChat = chat => pickProps(chat, allowedChatProps);
const uniqArray = arr => Array.from(new Set(arr));
const reduceChatsToMapById = chats =>
  chats.reduce((res, cur) => ({ ...res, [cur.id]: cur }), {});
const mapChatsToIds = chats => chats.map(({ id }) => id);

export default createModel({
  prefix: 'groupChats',
  origin: {
    groupIdsByRecent: [],
    idsMapByGroup: {},
    detailMapById: {},
  },
  getter: {
    groupIdsByRecent: state => state.groupIdsByRecent,
    idsMapByGroup: state => state.idsMapByGroup,
    detailMapById: state => state.detailMapById,
  },
  action: {
    clearAll: () => ({
      groupIdsByRecent: [],
      idsMapByGroup: {},
      detailMapById: {},
    }),
    clearByGroup: (prevState, group) =>
      immutable.on(prevState)(
        immutable.fset('groupIdsByRecent', ids =>
          ids.filter(id => id !== group),
        ),
        immutable.fset('detailMapById', map =>
          omitProps(map, prevState.idsMapByGroup[group]),
        ),
        immutable.fset(
          'idsMapByGroup',
          map => ({ [group]: removed, ...rest }) => rest,
        ),
      ),
    appendByGroup: (prevState, group, chats) =>
      immutable.on(prevState)(
        immutable.fset('groupIdsByRecent', ids => uniqArray([group, ...ids])),
        immutable.fset('detailMapById', map => ({
          ...map,
          ...reduceChatsToMapById(chats.map(validateChat)),
        })),
        immutable.fset(`idsMapByGroup.${group}`, (ids = []) => [
          ...ids,
          ...mapChatsToIds(chats),
        ]),
      ),
    prependByGroup: (prevState, group, chats) =>
      immutable.on(prevState)(
        immutable.fset('groupIdsByRecent', ids => uniqArray([group, ...ids])),
        immutable.fset('detailMapById', map => ({
          ...map,
          ...reduceChatsToMapById(chats.map(validateChat)),
        })),
        immutable.fset(`idsMapByGroup.${group}`, (ids = []) => [
          ...mapChatsToIds(chats),
          ...ids,
        ]),
      ),
  },
});
