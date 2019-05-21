import * as routerUtils from '../mobx/routerStore';
import {
  getProfileManager,
  getProfileManagerInterval,
} from '../modules/profiles-manage/getset';

const openCustomNoti = async customNoti => {
  if (!customNoti) {
    return;
  }
  //
  let mgr = getProfileManager();
  if (!mgr) {
    routerUtils.goToProfilesManage();
    mgr = await getProfileManagerInterval();
  }
  if (mgr) {
    mgr.signinByCustomNoti(customNoti);
  }
};

export default openCustomNoti;
