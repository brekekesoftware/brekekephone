package com.brekeke.phonedev;

import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;
import java.util.ArrayList;

public class IncomingCallActivityManager {
  public ArrayList<IncomingCallActivity> activities = new ArrayList<IncomingCallActivity>();

  public void push(IncomingCallActivity a) {
    activities.add(a);
  }

  public void remove(String uuid) {
    IncomingCallModule.tryBackToBackground();
    try {
      at(uuid).forceFinish();
    } catch (Exception e) {
    }
    try {
      activities.remove(index(uuid));
    } catch (Exception e) {
    }
  }

  public void removeAll() {
    IncomingCallModule.tryBackToBackground();
    try {
      for (IncomingCallActivity a : activities) {
        a.closedWithAnswerPressed = false;
        a.forceFinish();
      }
      activities.clear();
    } catch (Exception e) {
    }
  }

  public void removeAllAndBackToForeground() {
    removeAll();
    IncomingCallModule.emit("backToForeground", "");
  }

  public IncomingCallActivity at(String uuid) {
    for (IncomingCallActivity a : activities) {
      if (a.uuid.equals(uuid)) {
        return a;
      }
    }
    return null;
  }

  public int index(String uuid) {
    int i = 0;
    for (IncomingCallActivity a : activities) {
      if (a.uuid.equals(uuid)) {
        return i;
      }
      i++;
    }
    return -1;
  }

  public IncomingCallActivity first() {
    try {
      return activities.get(0);
    } catch (Exception e) {
      return null;
    }
  }

  public IncomingCallActivity last() {
    try {
      return activities.get(activities.size() - 1);
    } catch (Exception e) {
      return null;
    }
  }

  public IncomingCallActivity before(String uuid) {
    try {
      return activities.get(index(uuid) - 1);
    } catch (Exception e) {
      return null;
    }
  }

  public String uuidBefore(String uuid) {
    try {
      IncomingCallActivity a = before(uuid);
      return a == null ? "" : a.uuid;
    } catch (Exception e) {
      return "";
    }
  }

  public Boolean shouldUseExitActivity(Activity a) {
    try {
      return ((ActivityManager) a.getSystemService(Context.ACTIVITY_SERVICE))
              .getRunningTasks(1)
              .get(0)
              .numActivities
          == 1;
    } catch (Exception e) {
      return true;
    }
  }
}
