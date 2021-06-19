package com.brekeke.phonedev;

import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;
import java.util.ArrayList;
import java.util.stream.IntStream;

public class IncomingCallActivityManager {
  public static ArrayList<IncomingCallActivity> activities = new ArrayList<IncomingCallActivity>();

  public ArrayList<IncomingCallActivity> getList() {
    return activities;
  }

  public void removeUUID(String uuid) {
    int index = this.getItemIndex(uuid);
    if (index != -1) {
      activities.remove(index);
    }
  }

  public int getNumberActivitys(Activity a) {
    ActivityManager manager = (ActivityManager) a.getSystemService(Context.ACTIVITY_SERVICE);
    ActivityManager.RunningTaskInfo info = manager.getRunningTasks(1).get(0);
    return info.numActivities;
  }

  public void finishAll() {
    activities.forEach(
        incomingCallActivity -> {
          incomingCallActivity.forceFinish();
        });
    activities.clear();
  }

  public IncomingCallActivity last() {
    return activities.get(activities.size() - 1);
  }

  public IncomingCallActivity first() {
    return activities.get(0);
  }

  public boolean isEmpty() {
    return activities.isEmpty();
  }

  public void push(IncomingCallActivity item) {
    activities.add(item);
  }

  public void pop() {
    if (activities.size() >= 1) {
      activities.remove(activities.size() - 1);
    }
  }

  public IncomingCallActivity at(String uuid) {
    for (IncomingCallActivity item : activities) {
      if (item.uuid.equals(uuid)) {
        return item;
      }
    }
    return null;
  }

  public int getItemIndex(String uuid) {
    int index = -1;
    for (int i = 0; i < activities.size(); i++) {
      if (activities.get(i).uuid.equals(uuid)) {
        return i;
      }
    }
    return index;
  }

  public String getUuidOfBeforeItem(String uuid) {
    return this.before(uuid) == null ? "" : this.before(uuid).uuid;
  }

  public String getUuidOfAfterItem(String uuid) {
    return this.after(uuid) == null ? "" : this.after(uuid).uuid;
  }

  public IncomingCallActivity before(String uuid) {
    if (activities.size() <= 1) {
      return null;
    }
    int index = this.getItemIndex(uuid);
    if (index == -1 || index == 0) {
      return null;
    } else {
      return activities.get(index - 1);
    }
  }

  public IncomingCallActivity after(String uuid) {
    if (activities.size() <= 1) {
      return null;
    }
    int index =
        IntStream.range(0, activities.size())
            .filter(i -> activities.get(i).uuid.equals(uuid))
            .findFirst() // first occurrence
            .orElse(-1);
    if (index == activities.size() - 2) {
      return null;
    } else {
      return activities.get(index + 1);
    }
  }
}
