import {
  mdiAccountCircleOutline,
  mdiPhoneOutline,
  mdiSettingsOutline,
} from '@mdi/js';

import g from '../global';
import authStore from '../global/authStore';
import intl from '../intl/intl';
import { arrToMap } from '../utils/toMap';

const genMenus = () => {
  const arr = [
    {
      key: `contact`,
      icon: mdiAccountCircleOutline,
      subMenus: [
        {
          key: `phonebook`,
          label: intl`PHONEBOOK`,
          navFnKey: `goToPageContactPhonebook`,
        },
        {
          key: `users`,
          label: intl`USERS`,
          navFnKey: `goToPageContactUsers`,
        },
        {
          key: `chat`,
          label: intl`CHAT`,
          navFnKey: `goToPageChatRecents`,
          ucRequired: true,
        },
      ],
      defaultSubMenuKey: `users`,
    },
    {
      key: `call`,
      icon: mdiPhoneOutline,
      subMenus: [
        {
          key: `keypad`,
          label: intl`KEYPAD`,
          navFnKey: `goToPageCallKeypad`,
        },
        {
          key: `recents`,
          label: intl`RECENTS`,
          navFnKey: `goToPageCallRecents`,
        },
        {
          key: `parks`,
          label: intl`PARKS`,
          navFnKey: `goToPageCallParks`,
        },
      ],
      defaultSubMenuKey: `recents`,
    },
    {
      key: `settings`,
      icon: mdiSettingsOutline,
      subMenus: [
        {
          key: `profile`,
          label: intl`CURRENT ACCOUNT`,
          navFnKey: `goToPageSettingsProfile`,
        },
        {
          key: `other`,
          label: intl`OTHER SETTINGS`,
          navFnKey: `goToPageSettingsOther`,
        },
      ],
      defaultSubMenuKey: `profile`,
    },
  ];
  //
  arr.forEach((m, i) => {
    m.subMenusMap = arrToMap(
      m.subMenus,
      s => s.key,
      s => s,
    );
    m.defaultSubMenu = m.subMenusMap[m.defaultSubMenuKey];
    m.subMenus.forEach(s => {
      s.navFn = () => {
        if (s.ucRequired && !authStore.currentProfile?.ucEnabled) {
          m.defaultSubMenu.navFn();
          return;
        }
        g[s.navFnKey]();
        saveNavigation(i, s.key);
      };
    });
    m.navFn = () => {
      let k = authStore.currentProfile?.navSubMenus?.[i];
      if (!(k in m.subMenusMap)) {
        k = m.defaultSubMenuKey;
      }
      m.subMenusMap[k].navFn();
    };
  });
  return arr;
};

let lastLocale = g.locale;
let lastMenus = genMenus();
export const menus = () => {
  if (lastLocale !== g.locale) {
    lastLocale = g.locale;
    lastMenus = genMenus();
  }
  return lastMenus;
};

const saveNavigation = (i, k) => {
  const arr = menus();
  const m = arr[i];
  const p = authStore.currentProfile;
  if (!m || !p) {
    return;
  }
  if (!(k in m.subMenusMap)) {
    k = m.defaultSubMenuKey;
  }
  normalizeSavedNavigation();
  if (m.key !== `settings`) {
    p.navIndex = i;
  }
  p.navSubMenus[i] = k;
  g.saveProfilesToLocalStorage();
};
const normalizeSavedNavigation = () => {
  const arr = menus();
  const p = authStore.currentProfile;
  if (!arr[p.navIndex]) {
    p.navIndex = 0;
  }
  if (p.navSubMenus?.length !== arr.length) {
    p.navSubMenus = arr.map(m => null);
  }
  arr.forEach((m, i) => {
    if (!(p.navSubMenus[i] in m.subMenusMap)) {
      p.navSubMenus[i] = m.defaultSubMenuKey;
    }
  });
};

g.goToPageIndex = () => {
  if (!authStore.currentProfile) {
    g.goToPageProfileSignIn();
    return;
  }
  const arr = menus();
  normalizeSavedNavigation();
  const p = authStore.currentProfile;
  const i = p.navIndex;
  const k = p.navSubMenus[i];
  arr[i].subMenusMap[k].navFn();
};

export const getSubMenus = menu => {
  const arr = menus();
  const m = arr.find(m => m.key === menu);
  if (!m) {
    g.showError({
      unexpectedErr: new Error(`Can not find sub menus for ${menu}`),
    });
    return [];
  }
  return m.subMenus.filter(
    s => !(s.ucRequired && !authStore.currentProfile?.ucEnabled),
  );
};
