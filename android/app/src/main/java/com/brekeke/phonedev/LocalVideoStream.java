package com.brekeke.phonedev;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.util.AttributeSet;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.RelativeLayout;
import androidx.cardview.widget.CardView;
import com.oney.WebRTCModule.WebRTCView;

public class LocalVideoStream extends RelativeLayout {
    private int lastX;
    private int lastY;
    private ViewGroup parentContainer;
    private WebRTCView vLocalWebrtcVideo;

    public LocalVideoStream(Context context) {
        super(context);
    }
    public void setStreamURL(String url){
        if(vLocalWebrtcVideo != null){
            this.removeView(vLocalWebrtcVideo);
        }
        vLocalWebrtcVideo = new WebRTCView(BrekekeUtils.ctx);
        vLocalWebrtcVideo.setLayoutParams(
         new RelativeLayout.LayoutParams(
          LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));
        vLocalWebrtcVideo.setObjectFit("cover");
        this.addView(vLocalWebrtcVideo);
        vLocalWebrtcVideo.setStreamURL(url);
    }
    public LocalVideoStream(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public LocalVideoStream(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        int x = (int) event.getRawX();
        int y = (int) event.getRawY();
        ViewGroup.MarginLayoutParams layoutParams = (ViewGroup.MarginLayoutParams) getLayoutParams();

        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                lastX = x;
                lastY = y;
                parentContainer.requestDisallowInterceptTouchEvent(true);
                break;
            case MotionEvent.ACTION_MOVE:
                int deltaX = x - lastX;
                int deltaY = y - lastY;
                int newLeft = getLeft() + deltaX;
                int newTop = getTop() + deltaY;
                int newRight = newLeft + getWidth();
                int newBottom = newTop + getHeight();
                layoutParams.leftMargin = newLeft;
                layoutParams.topMargin = newTop;
                setLayoutParams(layoutParams);
                layout(newLeft, newTop, newRight, newBottom);
                lastX = x;
                lastY = y;
                break;
            case MotionEvent.ACTION_UP:
                parentContainer.requestDisallowInterceptTouchEvent(false);
                break;
        }
        return true;
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        parentContainer = (ViewGroup) getParent();
    }

}