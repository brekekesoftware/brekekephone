import {
  mdiAccountCircleOutline,
  mdiPhoneOutline,
  mdiSettingsOutline,
} from '@mdi/js';

import g from '../global';
import authStore from '../global/authStore';
import { arrToMap } from '../utils/toMap';

export const menus = [
  {
    key: `contact`,
    icon: mdiAccountCircleOutline,
    subMenus: [
      {
        key: `phonebook`,
        label: `PHONEBOOK`,
        navFnKey: `goToPageContactPhonebook`,
      },
      {
        key: `users`,
        label: `USERS`,
        navFnKey: `goToPageContactUsers`,
      },
      {
        key: `chat`,
        label: `CHAT`,
        navFnKey: `goToPageChatRecents`,
      },
    ],
    defaultSubMenu: `users`,
  },
  {
    key: `call`,
    icon: mdiPhoneOutline,
    subMenus: [
      {
        key: `keypad`,
        label: `KEYPAD`,
        navFnKey: `goToPageCallKeypad`,
      },
      {
        key: `recents`,
        label: `RECENTS`,
        navFnKey: `goToPageCallRecents`,
      },
      {
        key: `parks`,
        label: `PARKS`,
        navFnKey: `goToPageCallParks`,
      },
    ],
    defaultSubMenu: `recents`,
  },
  {
    key: `settings`,
    icon: mdiSettingsOutline,
    subMenus: [
      {
        key: `profile`,
        label: `CURRENT SERVER`,
        navFnKey: `goToPageSettingsProfile`,
      },
      {
        key: `other`,
        label: `OTHER SETTINGS`,
        navFnKey: `goToPageSettingsOther`,
      },
    ],
    defaultSubMenu: `profile`,
  },
];

menus.forEach((m, i) => {
  m.subMenus.forEach(s => {
    s.navFn = () => {
      g[s.navFnKey]();
      saveNavigation(i, s.key);
    };
  });
  m.subMenusMap = arrToMap(
    m.subMenus,
    s => s.key,
    s => s,
  );
  m.navFn = () => {
    let k = authStore.currentProfile?.navSubMenus?.[i];
    if (!(k in m.subMenusMap)) {
      k = m.defaultSubMenu;
    }
    m.subMenusMap[k].navFn();
  };
});

const saveNavigation = (i, k) => {
  const m = menus[i];
  const p = authStore.currentProfile;
  if (!m || !p) {
    return;
  }
  if (!(k in m.subMenusMap)) {
    k = m.defaultSubMenu;
  }
  normalizeSavedNavigation();
  if (m.key !== `settings`) {
    p.navIndex = i;
  }
  p.navSubMenus[i] = k;
  g.saveProfilesToLocalStorage();
};
const normalizeSavedNavigation = () => {
  const p = authStore.currentProfile;
  if (!menus[p.navIndex]) {
    p.navIndex = 0;
  }
  if (p.navSubMenus?.length !== menus.length) {
    p.navSubMenus = menus.map(m => null);
  }
  menus.forEach((m, i) => {
    if (!(p.navSubMenus[i] in m.subMenusMap)) {
      p.navSubMenus[i] = m.defaultSubMenu;
    }
  });
};

g.goToPageIndex = () => {
  if (!authStore.currentProfile) {
    g.goToPageProfileSignIn();
    return;
  }
  normalizeSavedNavigation();
  const p = authStore.currentProfile;
  const i = p.navIndex;
  const k = p.navSubMenus[i];
  menus[i].subMenusMap[k].navFn();
};
