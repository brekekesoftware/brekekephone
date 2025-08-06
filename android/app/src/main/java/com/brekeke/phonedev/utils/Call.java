package com.brekeke.phonedev.utils;

import com.brekeke.phonedev.BrekekeUtils;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;
import org.json.JSONObject;

public class Call {
  private static Queue<Map<String, String>> pending;
  private static Map<String, String> current;

  static {
    pending = new LinkedList<>();
    current = null;
  }

  public static boolean isPnIdInPending(String pnId) {
    if (pnId == null) return false;
    for (var p : pending) {
      if (pnId.equals(p.get("x_pn-id"))) return true;
    }
    return false;
  }

  public static void onIncoming(Map<String, String> m) {
    if (m == null) {
      return;
    }
    var pnId = m.get("x_pn-id");
    if (pnId == null) {
      return;
    }
    if ((current != null && pnId.equals(current.get("x_pn-id")))) {
      return;
    }

    if (current == null) {
      current = m;
      BrekekeUtils.displayIncomingCall(current);
    } else {
      pending.add(m);
    }
  }

  public static void onHandled(String pnIdOrUuid) {
    if (current == null || pnIdOrUuid == null) {
      return;
    }
    var uuid = current.get("callkeepUuid");
    var pnid = current.get("x_pn-id");
    if (!pnIdOrUuid.equals(uuid) && !pnIdOrUuid.equals(pnid)) {
      return;
    }

    current = pending.poll();
    if (current != null) {
      Emitter.emit("showIncomingCall", new JSONObject(current).toString());
      BrekekeUtils.displayIncomingCall(current);
    }
  }

  public static Map<String, String> getCurrent() {
    return current;
  }
}
