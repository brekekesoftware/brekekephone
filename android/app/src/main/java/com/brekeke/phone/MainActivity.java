package com.brekeke.phone;

import com.facebook.react.ReactActivity;
import android.content.Intent;

//import com.microsoft.codepush.react.CodePush;

public class MainActivity extends ReactActivity {
	@Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
    }
        //@Override
        //protected String getJSBundleFile() {
        //return CodePush.getJSBundleFile();
        //}
    

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "App";
    }
}
