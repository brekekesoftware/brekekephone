package com.brekeke.phonedev;

import android.app.Activity;
import android.app.ActivityManager;
import android.app.KeyguardManager;
import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.RelativeLayout;
import android.widget.TextView;
import androidx.annotation.Nullable;

public class IncomingCallActivityManager {
  public ArrayList<IncomingCallActivity> activities = new ArrayList<IncomingCallActivity>();

  public IncomingCallActivity last() {
    return activities.get(activities.size() - 1);
  }
  public IncomingCallActivity first() {
    return activities.get(0);
  }

  public IncomingCallActivity at(String uuid) {
    // TODO
  }
  public IncomingCallActivity before(String uuid) {
    // TODO
  }
  public IncomingCallActivity after(String uuid) {
    // TODO
  }


}
