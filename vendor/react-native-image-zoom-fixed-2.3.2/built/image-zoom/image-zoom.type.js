'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ImageZoomState = exports.ImageZoomProps = void 0;
var ImageZoomProps = /** @class */ (function () {
  function ImageZoomProps() {
    /**
     * 操作区域宽度
     */
    this.cropWidth = 100;
    /**
     * 操作区域高度
     */
    this.cropHeight = 100;
    /**
     * 图片宽度
     */
    this.imageWidth = 100;
    /**
     * 图片高度
     */
    this.imageHeight = 100;
    /**
     * 单手是否能移动图片
     */
    this.panToMove = true;
    /**
     * 多手指是否能缩放
     */
    this.pinchToZoom = true;
    /**
     * 双击能否放大
     */
    this.enableDoubleClickZoom = true;
    /**
     * 单击最大位移
     */
    this.clickDistance = 10;
    /**
     * 最大滑动阈值
     */
    this.maxOverflow = 100;
    /**
     * 长按的阈值（毫秒）
     */
    this.longPressTime = 800;
    /**
     * 双击计时器最大间隔
     */
    this.doubleClickInterval = 175;
    this.style = {};
    /**
     * threshold for firing swipe down function
     */
    this.swipeDownThreshold = 230;
    /**
     * for enabling vertical movement if user doesn't want it
     */
    this.enableSwipeDown = false;
    /**
     * for disabling focus on image center if user doesn't want it
     */
    this.enableCenterFocus = true;
    /**
     * for disabling rendering to hardware texture on Android
     */
    this.useHardwareTextureAndroid = true;
    /**
     * minimum zoom scale
     */
    this.minScale = 0.6;
    /**
     * maximum zoom scale
     */
    this.maxScale = 10;
    /**
     * 是否启用原生动画驱动
     * Whether to use native code to perform animations.
     */
    this.useNativeDriver = false;
    /**
     * 单击的回调
     */
    this.onClick = function () {
      //
    };
    /**
     * 双击的回调
     */
    this.onDoubleClick = function () {
      //
    };
    /**
     * 长按的回调
     */
    this.onLongPress = function () {
      //
    };
    /**
     * 横向超出的距离，父级做图片切换时，可以监听这个函数
     * 当此函数触发时，可以做切换操作
     */
    this.horizontalOuterRangeOffset = function () {
      //
    };
    /**
     * 触发想切换到左边的图，向左滑动速度超出阈值时触发
     */
    this.onDragLeft = function () {
      //
    };
    /**
     * 松手但是没有取消看图的回调
     */
    this.responderRelease = function () {
      //
    };
    /**
     * If provided, this will be called everytime the map is moved
     */
    this.onMove = function () {
      //
    };
    /**
     * If provided, this method will be called when the onLayout event fires
     */
    this.layoutChange = function () {
      //
    };
    /**
     * function that fires when user swipes down
     */
    this.onSwipeDown = function () {
      //
    };
    /**
     * Allows overriding the default onStartShouldSetPanResponder behavior.
     * By default, always becomes the responder
     */
    this.onStartShouldSetPanResponder = function () {
      return true;
    };
    /**
     * Allows overriding the default onPanResponderTerminationRequest behavior.
     * By default, doesn't terminate until the press ends
     */
    this.onPanResponderTerminationRequest = function () {
      return false;
    };
  }
  return ImageZoomProps;
})();
exports.ImageZoomProps = ImageZoomProps;
var ImageZoomState = /** @class */ (function () {
  function ImageZoomState() {
    /**
     * 中心 x 坐标
     */
    this.centerX = 0.5;
    /**
     * 中心 y 坐标
     */
    this.centerY = 0.5;
  }
  return ImageZoomState;
})();
exports.ImageZoomState = ImageZoomState;
// # sourceMappingURL=image-zoom.type.js.map
