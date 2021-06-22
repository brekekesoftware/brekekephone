package com.brekeke.phonedev;

import java.util.ArrayList;

public class IncomingCallActivityManager {
  public ArrayList<IncomingCallActivity> activities = new ArrayList<IncomingCallActivity>();

  public void push(IncomingCallActivity a) {
    activities.add(a);
  }

  public void remove(String uuid) {
    try {
      if (!at(uuid).answered) {
        IncomingCallModule.tryBackToBackground();
      }
    } catch (Exception e) {
    }
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
    if (activities.size() <= 0) {
      return;
    }
    Boolean atLeastOneAnswerPressed = false;
    try {
      for (IncomingCallActivity a : activities) {
        atLeastOneAnswerPressed = atLeastOneAnswerPressed || a.answered;
        a.answered = false;
        a.forceFinish();
      }
      activities.clear();
    } catch (Exception e) {
    }
    if (!atLeastOneAnswerPressed) {
      IncomingCallModule.tryBackToBackground();
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

  public void onActivityStop() {
    Boolean anyRunning = false, anyAnswered = false;
    for (IncomingCallActivity a : activities) {
      if (!a.closed && !a.paused) {
        anyRunning = true;
      }
      if (a.answered) {
        anyAnswered = true;
      }
    }
    if (anyRunning || !anyAnswered) {
      return;
    }
    removeAllAndBackToForeground();
  }
}
