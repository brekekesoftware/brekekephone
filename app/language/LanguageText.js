
class LanguageText {

    constructor(){
    }

    //language_en.
    load( lang ) {
        import('./language-' + lang + ".txt").then( (ret) =>{
            }
        );
    }
	
    static async getInstance( lang ){
        return await AsyncStorage.getItem( "com.brekeke.phone.language.UserLanguage.language" );
    }

    static async setLanguage( lang ){
        await AsyncStorage.setItem( "com.brekeke.phone.language.UserLanguage.language", lang );
    }
}
export default new UserLanguage()
