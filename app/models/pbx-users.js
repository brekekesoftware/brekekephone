import { createModel } from '@thenewvu/redux-model';
import immutable from '@thenewvu/immutable';
import pickProps from 'lodash.pick';

const allowedCreatedProps = ['id', 'name'];
const propDefault = {
  callingTalkers: [],
  ringingTalkers: [],
  talkingTalkers: [],
  holdingTalkers: [],
};
const validateCreatingUser = user => ({
  ...propDefault,
  ...pickProps(user, allowedCreatedProps),
});
const reduceUsersToMapById = users =>
  users.reduce((res, cur) => ({ ...res, [cur.id]: cur }), {});
const mapUsersToIds = users => users.map(({ id }) => id);

export default createModel({
  prefix: 'pbxUsers',
  origin: {
    idsByOrder: [],
    detailMapById: {},
  },
  getter: {
    idsByOrder: state => state.idsByOrder,
    detailMapById: state => state.detailMapById,
  },
  action: {
    refill: (prevState, users) => ({
      idsByOrder: mapUsersToIds(users),
      detailMapById: reduceUsersToMapById(users.map(validateCreatingUser)),
    }),
    setTalkerCalling: (prevState, user, talker) =>
      immutable.on(prevState)(
        immutable.fset(`detailMapById.${user}.callingTalkers`, talkers => [
          ...talkers,
          talker,
        ]),
      ),
    setTalkerRinging: (prevState, user, talker) =>
      immutable.on(prevState)(
        immutable.fset(`detailMapById.${user}.ringingTalkers`, talkers => [
          ...talkers,
          talker,
        ]),
      ),
    setTalkerHolding: (prevState, user, talker) =>
      immutable.on(prevState)(
        immutable.fset(`detailMapById.${user}.holdingTalkers`, talkers => [
          ...talkers,
          talker,
        ]),
        immutable.fset(`detailMapById.${user}.talkingTalkers`, talkers =>
          talkers.filter(_ => _ !== talker),
        ),
      ),
    setTalkerTalking: (prevState, user, talker) =>
      immutable.on(prevState)(
        immutable.fset(`detailMapById.${user}.talkingTalkers`, talkers => [
          ...talkers,
          talker,
        ]),
        immutable.fset(`detailMapById.${user}.holdingTalkers`, talkers =>
          talkers.filter(_ => _ !== talker),
        ),
        immutable.fset(`detailMapById.${user}.callingTalkers`, talkers =>
          talkers.filter(_ => _ !== talker),
        ),
        immutable.fset(`detailMapById.${user}.ringingTalkers`, talkers =>
          talkers.filter(_ => _ !== talker),
        ),
      ),
    setTalkerHanging: (prevState, user, talker) =>
      immutable.on(prevState)(
        immutable.fset(`detailMapById.${user}.talkingTalkers`, talkers =>
          talkers.filter(_ => _ !== talker),
        ),
        immutable.fset(`detailMapById.${user}.holdingTalkers`, talkers =>
          talkers.filter(_ => _ !== talker),
        ),
        immutable.fset(`detailMapById.${user}.callingTalkers`, talkers =>
          talkers.filter(_ => _ !== talker),
        ),
        immutable.fset(`detailMapById.${user}.ringingTalkers`, talkers =>
          talkers.filter(_ => _ !== talker),
        ),
      ),
  },
});
