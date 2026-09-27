'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.State = exports.Props = void 0
var React = require('react')
var react_native_1 = require('react-native')
var image_viewer_style_1 = require('./image-viewer.style')

var Props = /** @class */ (function () {
  function Props() {
    /**
     * 是否显示
     */
    this.show = false
    /**
     * 图片数组
     */
    this.imageUrls = []
    /**
     * 滑动到下一页的X阈值
     */
    this.flipThreshold = 80
    /**
     * 当前页能滑到下一页X位置最大值
     */
    this.maxOverflow = 300
    /**
     * 初始显示第几张图
     */
    this.index = 0
    /**
     * 加载失败的图
     */
    this.failImageSource = undefined
    /**
     * 背景颜色
     */
    this.backgroundColor = 'black'
    /**
     * style props for the footer container
     */
    this.footerContainerStyle = {}
    /**
     * Menu Context Values
     */
    this.menuContext = { saveToLocal: 'save to the album', cancel: 'cancel' }
    /**
     * 是否开启长按保存到本地的功能
     */
    this.saveToLocalByLongPress = true
    /**
     * 是否允许缩放图片
     */
    this.enableImageZoom = true
    this.style = {}
    /**
     * Enable swipe down to close image viewer.
     * When swipe down, will trigger onCancel.
     */
    this.enableSwipeDown = false
    /**
     * 是否预加载图片
     */
    this.enablePreload = false
    /**
     * 翻页时的动画时间
     */
    this.pageAnimateTime = 100
    /**
     * 是否启用原生动画驱动
     * Whether to use the native code to perform animations.
     */
    this.useNativeDriver = false
    /**
     * 长按图片的回调
     */
    this.onLongPress = function () {
      //
    }
    /**
     * 单击回调
     */
    this.onClick = function () {
      //
    }
    /**
     * 双击回调
     */
    this.onDoubleClick = function () {
      //
    }
    /**
     * 图片保存到本地方法，如果写了这个方法，就不会调取系统默认方法
     * 针对安卓不支持 saveToCameraRoll 远程图片，可以在安卓调用此回调，调用安卓原生接口
     */
    this.onSave = function () {
      //
    }
    this.onMove = function () {
      //
    }
    /**
     * 自定义头部
     */
    this.renderHeader = function () {
      return null
    }
    /**
     * 自定义尾部
     */
    this.renderFooter = function () {
      return null
    }
    /**
     * 自定义计时器
     */
    this.renderIndicator = function (currentIndex, allSize) {
      return React.createElement(
        react_native_1.View,
        { style: image_viewer_style_1.simpleStyle.count },
        React.createElement(
          react_native_1.Text,
          { style: image_viewer_style_1.simpleStyle.countText },
          currentIndex + '/' + allSize,
        ),
      )
    }
    /**
     * Render image component
     */
    this.renderImage = function (props) {
      return React.createElement(react_native_1.Image, props)
    }
    /**
     * 自定义左翻页按钮
     */
    this.renderArrowLeft = function () {
      return null
    }
    /**
     * 自定义右翻页按钮
     */
    this.renderArrowRight = function () {
      return null
    }
    /**
     * 弹出大图的回调
     */
    this.onShowModal = function () {
      //
    }
    /**
     * 取消看图的回调
     */
    this.onCancel = function () {
      //
    }
    /**
     * function that fires when user swipes down
     */
    this.onSwipeDown = function () {
      //
    }
    /**
     * 渲染loading元素
     */
    this.loadingRender = function () {
      return null
    }
    /**
     * 保存到相册的回调
     */
    this.onSaveToCamera = function () {
      //
    }
    /**
     * 当图片切换时触发
     */
    this.onChange = function () {
      //
    }
  }
  return Props
})()
exports.Props = Props
var State = /** @class */ (function () {
  function State() {
    /**
     * 是否显示
     */
    this.show = false
    /**
     * 当前显示第几个
     */
    this.currentShowIndex = 0
    /**
     * Used to detect if parent component applied new index prop
     */
    this.prevIndexProp = 0
    /**
     * 图片拉取是否完毕了
     */
    this.imageLoaded = false
    /**
     * 图片长宽列表
     */
    this.imageSizes = []
    /**
     * 是否出现功能菜单
     */
    this.isShowMenu = false
  }
  return State
})()
exports.State = State
// # sourceMappingURL=image-viewer.type.js.map
