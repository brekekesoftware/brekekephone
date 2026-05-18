package com.brekeke.phonedev.utils;

import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;
import com.brekeke.phonedev.R;

// utils to show toasts with level colors
// only used in incoming call activity

public class Toast {
  public enum Type {
    SUCCESS,
    ERROR,
    WARNING,
    INFO
  }

  private static int duration = 5000;

  // ==========================================================================
  // show with native type Type

  public static void show(LinearLayout container, String m, String d, Type t) {
    var h = Ctx.h();
    h.post(
        () -> {
          try {
            var ctx = Ctx.app();
            var v = LayoutInflater.from(ctx).inflate(R.layout.toast, null, true);
            v.setBackgroundColor(color(t));
            var mv = (TextView) v.findViewById(R.id.toast_message);
            mv.setText(m);
            var dv = (TextView) v.findViewById(R.id.toast_detail);
            if (!TextUtils.isEmpty(d)) {
              dv.setText(d);
              dv.setVisibility(View.VISIBLE);
            } else {
              dv.setVisibility(View.GONE);
            }
            container.addView(v, 0);
            h.postDelayed(
                () -> {
                  try {
                    container.removeView(v);
                  } catch (Exception e) {
                  }
                },
                duration);
          } catch (Exception e) {
          }
        });
  }

  private static int color(Type t) {
    var ctx = Ctx.app();
    var r = ctx.getResources();
    switch (t) {
      case SUCCESS:
        return r.getColor(R.color.toast_success);
      case ERROR:
        return r.getColor(R.color.toast_error);
      case WARNING:
        return r.getColor(R.color.toast_warning);
      default:
        return r.getColor(R.color.toast_info);
    }
  }

  // ==========================================================================
  // show with string type from rn

  public static void show(LinearLayout container, String m, String d, String t) {
    show(container, m, d, type(t));
  }

  private static Type type(String t) {
    switch (t.toLowerCase()) {
      case "success":
        return Toast.Type.SUCCESS;
      case "error":
        return Toast.Type.ERROR;
      case "warning":
        return Toast.Type.WARNING;
      case "info":
        return Toast.Type.INFO;
      default:
        return Toast.Type.INFO;
    }
  }
}
