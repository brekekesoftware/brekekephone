package com.brekeke.phonedev;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class ToastManager {
  private final Context context;
  private final LinearLayout container;
  private final Handler handler;
  private final Map<String, View> activeToasts;

  private ToastManager(Context context, LinearLayout container) {
    this.context = context;
    this.container = container;
    this.handler = new Handler(Looper.getMainLooper());
    this.activeToasts = new HashMap<>();
  }

  private static ToastManager instance;

  public static ToastManager getInstance(Context context, LinearLayout container) {
    if (instance == null) {
      instance = new ToastManager(context, container);
    }
    return instance;
  }

  private int getColorForType(ToastType type) {
    switch (type) {
      case SUCCESS:
        return context.getResources().getColor(R.color.toast_success);
      case ERROR:
        return context.getResources().getColor(R.color.toast_error);
      case WARNING:
        return context.getResources().getColor(R.color.toast_warning);
      default:
        return context.getResources().getColor(R.color.toast_info);
    }
  }

  public void show(String message, ToastType type, String error, int duration) {
    if (context == null || container == null) {
      return;
    }
    handler.post(
        () -> {
          try {
            View toastView = LayoutInflater.from(context).inflate(R.layout.view_toast, null, true);
            String id = UUID.randomUUID().toString();
            toastView.setBackgroundColor(getColorForType(type));
            TextView messageView = toastView.findViewById(R.id.toast_message);
            messageView.setText(message);
            TextView errorView = toastView.findViewById(R.id.toast_error_detail);
            if (error != null && !error.isEmpty()) {
              errorView.setText(error);
              errorView.setVisibility(View.VISIBLE);
            } else {
              errorView.setVisibility(View.GONE);
            }
            container.addView(toastView, 0);
            activeToasts.put(id, toastView);
            if (duration > 0) {
              handler.postDelayed(() -> hide(id), duration);
            }
          } catch (Exception e) {
          }
        });
  }

  public void show(String message, ToastType type) {
    show(message, type, null, 5000);
  }

  public void hide(String id) {
    handler.post(
        () -> {
          View view = activeToasts.get(id);
          if (view != null) {
            container.removeView(view);
            activeToasts.remove(id);
          }
        });
  }

  public void hideAll() {
    handler.post(
        () -> {
          container.removeAllViews();
          activeToasts.clear();
        });
  }
}
