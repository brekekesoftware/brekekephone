import shortid from 'shortid';

import { AsyncStorage } from '../native/Rn';
import { arrToMap } from '../utils/toMap';
import $ from './_';

$.extends({
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
    profiles: [],
    get profilesMap() {
      return arrToMap($.profiles, `id`, p => p);
    },
  },
  genEmptyProfile: () => ({
    id: shortid(),
    pbxTenant: ``,
    pbxUsername: ``,
    pbxHostname: ``,
    pbxPort: ``,
    pbxPassword: ``,
    pbxPhoneIndex: `4`,
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
      $.set(`profiles`, arr);
    }
  },
  saveProfilesToLocalStorage: async (arr = $.profiles) => {
    try {
      await AsyncStorage.setItem(`_api_profiles`, JSON.stringify(arr));
    } catch (err) {
      $.showError({ err, message: `save profiles to local storage` });
    }
  },
  upsertProfile: p => {
    $.upsert(`profiles`, p);
    $.saveProfilesToLocalStorage();
  },
  removeProfile: id => {
    $.remove(`profiles`, id);
    $.saveProfilesToLocalStorage();
  },
});
