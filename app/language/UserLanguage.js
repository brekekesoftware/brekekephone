

import {AsyncStorage} from 'react-native'

class UserLanguage {

    constructor(){
    }

    _load( jsonModule ){
        this._jsonModule = jsonModule;
    }

    _getMessage( key, defaultValue ){
        var msg = this._jsonModule[key];
        if( !msg ){
            msg = defaultValue;
        }
        return msg;
    }

     //language_en.
     static _loadToMap_s( map ) {

         let ths = this;

         var ulEn = new UserLanguage();
         import("./message-en.json")
             .then(
                 jsonModule => {
                     ulEn._load( jsonModule );
                     map["en"] = ulEn;




                     var ulJa = new UserLanguage();

                     import("./message-ja.json")
                         .then(
                             jsonModule => {
                                 ulJa._load( jsonModule );
                                 map["ja"] = ulJa;
                             }
                         );
                 }
             );

     }


    static async getUserzLanguage_s(){
         return await AsyncStorage.getItem( "com.brekeke.phone.language.UserLanguage.language" );
    }

    static async setUserzLanguage_s( lang ){
        await Promise.all([
            AsyncStorage.setItem( "com.brekeke.phone.language.UserLanguage.language", lang ),
            UserLanguage.refreshUserzInstance_s()
        ]);
    }

    static getUserzMessage_s( key ){
        if( !UserLanguage.INSTANCE ){
            return "";
        }

        return UserLanguage.INSTANCE._getMessage( key, "" );
    }

    static async init_s() {
        await UserLanguage.refreshUserzInstance_s();
    }

    static async refreshUserzInstance_s(){
        if( !UserLanguage._MAP ){
            UserLanguage._MAP = [];
            UserLanguage._loadToMap_s(UserLanguage._MAP);
        }

        await UserLanguage.getUserzLanguage_s().then( (lang) =>{
            if( !lang ){
                lang = "en";
            }
            var o = UserLanguage._MAP[lang];
            UserLanguage.INSTANCE = o;
        });
    }
}
UserLanguage._MAP = null;
UserLanguage.INSTANCE = null;
export default UserLanguage

