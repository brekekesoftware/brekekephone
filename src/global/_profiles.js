import shortid from 'shortid';

import { AsyncStorage } from '../native/Rn';
import { arrToMap } from '../utils/toMap';
import g from './_';

g.extends({
  observable: {
    // id: string
    // pbxHostname: string
    // pbxPort: string
    // pbxTenant: string
    // pbxUsername: string
    // pbxPassword: string
    // pbxPhoneIndex: string 1|2|3|4
    // pbxTurnEnabled: boolean
    // pushNotificationEnabled: boolean
    // parks: string[]
    // ucEnabled: boolean
    // ucHostname: string
    // ucPort: string
    // ucPathname: string
    // accessToken: string
    // recentCalls?[]
    //    id: string
    //    incoming: boolean
    //    answered: boolean
    //    partyName: string
    //    partyNumber: string
    //    created: Date
    // navIndex?: number
    // nav?: string[]
    profiles: [],
    get profilesMap() {
      return arrToMap(g.profiles, `id`, p => p);
    },
  },
  genEmptyProfile: () => ({
    id: shortid(),
    pbxTenant: ``,
    pbxUsername: ``,
    pbxHostname: ``,
    pbxPort: ``,
    pbxPassword: ``,
    pbxPhoneIndex: ``,
    pbxTurnEnabled: false,
    pushNotificationEnabled: true,
    parks: [],
    ucEnabled: false,
    ucHostname: ``,
    ucPort: ``,
    accessToken: ``,
    recentCalls: [],
  }),
  loadProfilesFromLocalStorage: async () => {
    let arr = await AsyncStorage.getItem(`_api_profiles`);
    if (arr && !Array.isArray(arr)) {
      try {
        arr = JSON.parse(arr);
      } catch (err) {
        arr = null;
      }
    }
    if (arr) {
      g.set(`profiles`, arr);
    }
  },
  saveProfilesToLocalStorage: async (arr = g.profiles) => {
    try {
      await AsyncStorage.setItem(`_api_profiles`, JSON.stringify(arr));
    } catch (err) {
      g.showError({ err, message: `save profiles to local storage` });
    }
  },
  upsertProfile: p => {
    g.upsert(`profiles`, p);
    g.saveProfilesToLocalStorage();
  },
  removeProfile: id => {
    g.remove(`profiles`, id);
    g.saveProfilesToLocalStorage();
  },
});
