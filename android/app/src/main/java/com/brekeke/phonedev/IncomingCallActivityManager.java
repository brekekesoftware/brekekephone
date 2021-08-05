package com.brekeke.phonedev;

import java.util.ArrayList;

public class IncomingCallActivityManager {
  public ArrayList<IncomingCallActivity> activities = new ArrayList<IncomingCallActivity>();
  // Manually manage activities size:
  // Try to increase BEFORE contructing the intent, the above activities is add AFTER constructing
  public int activitiesSize = 0;
  // Calls size from js
  public int callsSize = 0;

  public void remove(String uuid) {
    IncomingCallActivity a = at(uuid);
    if (a == null) {
      return;
    }
    try {
      activities.remove(index(uuid));
    } catch (Exception e) {
    }
    a.forceFinish();
    if (!a.answered) {
      IncomingCallModule.tryExitClearTask();
    }
  }

  public void removeAll() {
    if (activities.size() <= 0) {
      return;
    }
    boolean atLeastOneAnswerPressed = false;
    try {
      for (IncomingCallActivity a : activities) {
        atLeastOneAnswerPressed = atLeastOneAnswerPressed || a.answered;
        a.forceFinish();
      }
      activities.clear();
    } catch (Exception e) {
    }
    if (!atLeastOneAnswerPressed) {
      IncomingCallModule.tryExitClearTask();
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
      return before(uuid).uuid;
    } catch (Exception e) {
      return "";
    }
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

  // To open app when:
  // - call is answered and
  // - on pause (click home when locked) or destroy (click answer when forground)
  // TODO handle case multiple calls
  public void onActivityPauseOrDestroy() {
    if (activitiesSize > 1) {
      return;
    }
    if (IncomingCallModule.wl.isHeld()) {
      IncomingCallModule.wl.release();
    }
    try {
      if (last().answered) {
        removeAllAndBackToForeground();
      }
    } catch (Exception e) {
    }
    setBackgroundCalls(callsSize);
  }

  public void setBackgroundCalls(int n) {
    callsSize = n;
    try {
      for (IncomingCallActivity a : activities) {
        try {
          a.uiSetBackgroundCalls(n);
        } catch (Exception e) {
        }
      }
    } catch (Exception e) {
    }
  }
}
