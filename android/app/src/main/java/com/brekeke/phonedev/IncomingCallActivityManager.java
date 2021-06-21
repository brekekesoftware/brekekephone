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
    IncomingCallActivity a = at(uuid);
    if (a != null) {
      a.forceFinish();
    }
    int i = index(uuid);
    if (i != -1) {
      activities.remove(i);
    }
  }

  public void removeAll() {
    for (IncomingCallActivity a : activities) {
      a.forceFinish();
    }
    activities.clear();
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
    return activities.isEmpty() ? null : activities.get(0);
  }

  public IncomingCallActivity last() {
    return activities.isEmpty() ? null : activities.get(activities.size() - 1);
  }

  public IncomingCallActivity before(String uuid) {
    if (activities.size() <= 1) {
      return null;
    }
    int i = index(uuid);
    if (i == -1 || i == 0) {
      return null;
    } else {
      return activities.get(i - 1);
    }
  }

  public IncomingCallActivity after(String uuid) {
    if (activities.size() <= 1) {
      return null;
    }
    int i = index(uuid);
    if (i == -1 || i == activities.size() - 1) {
      return null;
    } else {
      return activities.get(i + 1);
    }
  }

  public String uuidBefore(String uuid) {
    return before(uuid) == null ? "" : before(uuid).uuid;
  }

  public String uuidAfter(String uuid) {
    return after(uuid) == null ? "" : after(uuid).uuid;
  }

  public Boolean shouldUseExitActivity(Activity a) {
    try {
      return ((ActivityManager) a.getSystemService(Context.ACTIVITY_SERVICE))
              .getRunningTasks(1)
              .get(0)
              .numActivities
          == 1;
    } catch (Exception ex) {
      return true;
    }
  }
}
