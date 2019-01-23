import { AsyncStorage } from 'react-native';

class UserLanguage {
  constructor() {}

  _load(jsonModule) {
    this._jsonModule = jsonModule;
  }

  _getMessage(key, defaultValue) {
    let msg = this._jsonModule[key];
    if (!msg) {
      msg = defaultValue;
    }
    return msg;
  }

  static async _loadToMap_s(map) {
    let ulEn = new UserLanguage();
    const jsonModuleEn = await import('./message-en.json');
    ulEn._load(jsonModuleEn);
    map['en'] = ulEn;

    let ulJa = new UserLanguage();
    const jsonModuleJa = await import('./message-ja.json');
    ulJa._load(jsonModuleJa);
    map['ja'] = ulJa;
  }

  static async getUserzLanguage_s() {
    return await AsyncStorage.getItem(
      'com.brekeke.phone.language.UserLanguage.language',
    );
  }

  static async setUserzLanguage_s(lang) {
    await Promise.all([
      AsyncStorage.setItem(
        'com.brekeke.phone.language.UserLanguage.language',
        lang,
      ),
      UserLanguage.refreshUserzInstance_s(),
    ]);
  }

  static getUserzMessage_s(key) {
    if (!UserLanguage.INSTANCE) {
      return '';
    }

    return UserLanguage.INSTANCE._getMessage(key, '');
  }

  static async init_s() {
    await UserLanguage.refreshUserzInstance_s();
  }

  static async refreshUserzInstance_s() {
    if (!UserLanguage._MAP) {
      UserLanguage._MAP = [];
      await UserLanguage._loadToMap_s(UserLanguage._MAP);
    }

    await UserLanguage.getUserzLanguage_s().then(lang => {
      if (!lang) {
        lang = 'en';
      }
      const o = UserLanguage._MAP[lang];
      UserLanguage.INSTANCE = o;
    });
  }
}
UserLanguage._MAP = null;
UserLanguage.INSTANCE = null;
export default UserLanguage;
