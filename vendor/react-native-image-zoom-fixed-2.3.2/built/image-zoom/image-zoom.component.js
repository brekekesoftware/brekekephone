'use strict';
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b) {
            if (b.hasOwnProperty(p)) {
              d[p] = b[p];
            }
          }
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) {
            if (Object.prototype.hasOwnProperty.call(s, p)) {
              t[p] = s[p];
            }
          }
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, '__esModule', { value: true });
var React = require('react');
var react_native_1 = require('react-native');
var image_zoom_style_1 = require('./image-zoom.style');
var image_zoom_type_1 = require('./image-zoom.type');

var ImageViewer = /** @class */ (function (_super) {
  __extends(ImageViewer, _super);
  function ImageViewer() {
    var _this = (_super !== null && _super.apply(this, arguments)) || this;
    _this.state = new image_zoom_type_1.ImageZoomState();
    // 上次/当前/动画 x 位移
    _this.lastPositionX = null;
    _this.positionX = 0;
    _this.animatedPositionX = new react_native_1.Animated.Value(0);
    // 上次/当前/动画 y 位移
    _this.lastPositionY = null;
    _this.positionY = 0;
    _this.animatedPositionY = new react_native_1.Animated.Value(0);
    // 缩放大小
    _this.scale = 1;
    _this.animatedScale = new react_native_1.Animated.Value(1);
    _this.zoomLastDistance = null;
    _this.zoomCurrentDistance = 0;
    _this.defaultScale = _this.props.minScale || 0;
    // 上次手按下去的时间
    _this.lastTouchStartTime = 0;
    // 滑动过程中，整体横向过界偏移量
    _this.horizontalWholeOuterCounter = 0;
    // 滑动过程中，swipeDown 偏移量
    _this.swipeDownOffset = 0;
    // 滑动过程中，x y的总位移
    _this.horizontalWholeCounter = 0;
    _this.verticalWholeCounter = 0;
    // 两手距离中心点位置
    _this.centerDiffX = 0;
    _this.centerDiffY = 0;
    // 上一次点击的时间
    _this.lastClickTime = 0;
    // 双击时的位置
    _this.doubleClickX = 0;
    _this.doubleClickY = 0;
    // 是否双击了
    _this.isDoubleClick = false;
    // 是否是长按
    _this.isLongPress = false;
    // 是否在左右滑
    _this.isHorizontalWrap = false;
    // 图片手势处理
    _this.imagePanResponder = react_native_1.PanResponder.create({
      // 要求成为响应者：
      onStartShouldSetPanResponder: _this.props.onStartShouldSetPanResponder,
      onPanResponderTerminationRequest: _this.props.onPanResponderTerminationRequest,
      onMoveShouldSetPanResponder: _this.props.onMoveShouldSetPanResponder,
      onPanResponderGrant(evt) {
        // 开始手势操作
        _this.lastPositionX = null;
        _this.lastPositionY = null;
        _this.zoomLastDistance = null;
        _this.horizontalWholeCounter = 0;
        _this.verticalWholeCounter = 0;
        _this.lastTouchStartTime = new Date().getTime();
        _this.isDoubleClick = false;
        _this.isLongPress = false;
        _this.isHorizontalWrap = false;
        // 任何手势开始，都清空单击计时器
        if (_this.singleClickTimeout) {
          clearTimeout(_this.singleClickTimeout);
        }
        // 计算长按
        if (_this.longPressTimeout) {
          clearTimeout(_this.longPressTimeout);
        }
        var _a = evt.nativeEvent;
        var locationX = _a.locationX;
        var locationY = _a.locationY;
        var pageX = _a.pageX;
        var pageY = _a.pageY;
        _this.longPressTimeout = setTimeout(() => {
          _this.isLongPress = true;
          if (_this.props.onLongPress) {
            _this.props.onLongPress({ locationX, locationY, pageX, pageY });
          }
        }, _this.props.longPressTime);
        if (evt.nativeEvent.touches.length <= 1) {
          // 一个手指的情况
          if (new Date().getTime() - _this.lastClickTime < (_this.props.doubleClickInterval || 0)) {
            // 认为触发了双击
            _this.lastClickTime = 0;
            // 因为可能触发放大，因此记录双击时的坐标位置
            _this.doubleClickX = evt.nativeEvent.touches[0].pageX;
            _this.doubleClickY = evt.nativeEvent.touches[0].pageY;
            if (_this.props.onDoubleClick) {
              _this.props.onDoubleClick({
                locationX: evt.nativeEvent.touches[0].locationX,
                locationY: evt.nativeEvent.touches[0].locationY,
                pageX: _this.doubleClickX,
                pageY: _this.doubleClickY,
              });
            }
            // 取消长按
            clearTimeout(_this.longPressTimeout);
            // 缩放
            _this.isDoubleClick = true;
            if (_this.props.enableDoubleClickZoom) {
              if (_this.scale > _this.defaultScale || _this.scale < _this.defaultScale) {
                // 回归原位
                _this.scale = _this.defaultScale;
                _this.positionX = 0;
                _this.positionY = 0;
              } else {
                // 开始在位移地点缩放
                // 记录之前缩放比例
                // 此时 this.scale 一定为 1
                var beforeScale = _this.scale;
                // 开始缩放
                _this.scale = _this.defaultScale * 2;
                // 缩放 diff
                var diffScale = _this.scale - beforeScale;
                // 找到两手中心点距离页面中心的位移
                // 移动位置
                _this.positionX = ((_this.props.cropWidth / 2 - _this.doubleClickX) * diffScale) / _this.scale;
                _this.positionY = ((_this.props.cropHeight / 2 - _this.doubleClickY) * diffScale) / _this.scale;
              }
              _this.imageDidMove('centerOn');
              react_native_1.Animated.parallel([
                react_native_1.Animated.timing(_this.animatedScale, {
                  toValue: _this.scale,
                  duration: 100,
                  useNativeDriver: !!_this.props.useNativeDriver,
                }),
                react_native_1.Animated.timing(_this.animatedPositionX, {
                  toValue: _this.positionX,
                  duration: 100,
                  useNativeDriver: !!_this.props.useNativeDriver,
                }),
                react_native_1.Animated.timing(_this.animatedPositionY, {
                  toValue: _this.positionY,
                  duration: 100,
                  useNativeDriver: !!_this.props.useNativeDriver,
                }),
              ]).start();
            }
          } else {
            _this.lastClickTime = new Date().getTime();
          }
        }
      },
      onPanResponderMove(evt, gestureState) {
        if (_this.isDoubleClick) {
          // 有时双击会被当做位移，这里屏蔽掉
          return;
        }
        if (evt.nativeEvent.touches.length > 2) {
          return;
        }
        if (evt.nativeEvent.touches.length > 1) {
          var centerX = (evt.nativeEvent.touches[0].pageX + evt.nativeEvent.touches[1].pageX) / 2;
          _this.centerDiffX = centerX - _this.props.cropWidth / 2;
          var centerY = (evt.nativeEvent.touches[0].pageY + evt.nativeEvent.touches[1].pageY) / 2;
          _this.centerDiffY = centerY - _this.props.cropHeight / 2;
        }
        if (evt.nativeEvent.touches.length === 1) {
          // x 位移
          var diffX = gestureState.dx - (_this.lastPositionX || 0);
          if (_this.lastPositionX === null) {
            diffX = 0;
          }
          // y 位移
          var diffY = gestureState.dy - (_this.lastPositionY || 0);
          if (_this.lastPositionY === null) {
            diffY = 0;
          }
          // 保留这一次位移作为下次的上一次位移
          _this.lastPositionX = gestureState.dx;
          _this.lastPositionY = gestureState.dy;
          _this.horizontalWholeCounter += diffX;
          _this.verticalWholeCounter += diffY;
          if (Math.abs(_this.horizontalWholeCounter) > 5 || Math.abs(_this.verticalWholeCounter) > 5) {
            // 如果位移超出手指范围，取消长按监听
            if (_this.longPressTimeout) {
              clearTimeout(_this.longPressTimeout);
            }
          }
          if (_this.props.panToMove) {
            // 处理左右滑，如果正在 swipeDown，左右滑失效
            if (_this.swipeDownOffset === 0) {
              if (Math.abs(diffX) > Math.abs(diffY)) {
                _this.isHorizontalWrap = true;
              }
              // diffX > 0 表示手往右滑，图往左移动，反之同理
              // horizontalWholeOuterCounter > 0 表示溢出在左侧，反之在右侧，绝对值越大溢出越多
              if (_this.props.imageWidth * _this.scale > _this.props.cropWidth) {
                // 如果图片宽度大图盒子宽度， 可以横向拖拽
                // 没有溢出偏移量或者这次位移完全收回了偏移量才能拖拽
                if (_this.horizontalWholeOuterCounter > 0) {
                  // 溢出在右侧
                  if (diffX < 0) {
                    // 从右侧收紧
                    if (_this.horizontalWholeOuterCounter > Math.abs(diffX)) {
                      // 偏移量还没有用完
                      _this.horizontalWholeOuterCounter += diffX;
                      diffX = 0;
                    } else {
                      // 溢出量置为0，偏移量减去剩余溢出量，并且可以被拖动
                      diffX += _this.horizontalWholeOuterCounter;
                      _this.horizontalWholeOuterCounter = 0;
                      if (_this.props.horizontalOuterRangeOffset) {
                        _this.props.horizontalOuterRangeOffset(0);
                      }
                    }
                  } else {
                    // 向右侧扩增
                    _this.horizontalWholeOuterCounter += diffX;
                  }
                } else if (_this.horizontalWholeOuterCounter < 0) {
                  // 溢出在左侧
                  if (diffX > 0) {
                    // 从左侧收紧
                    if (Math.abs(_this.horizontalWholeOuterCounter) > diffX) {
                      // 偏移量还没有用完
                      _this.horizontalWholeOuterCounter += diffX;
                      diffX = 0;
                    } else {
                      // 溢出量置为0，偏移量减去剩余溢出量，并且可以被拖动
                      diffX += _this.horizontalWholeOuterCounter;
                      _this.horizontalWholeOuterCounter = 0;
                      if (_this.props.horizontalOuterRangeOffset) {
                        _this.props.horizontalOuterRangeOffset(0);
                      }
                    }
                  } else {
                    // 向左侧扩增
                    _this.horizontalWholeOuterCounter += diffX;
                  }
                } else {
                  // 溢出偏移量为0，正常移动
                }
                // 产生位移
                _this.positionX += diffX / _this.scale;
                // 但是横向不能出现黑边
                // 横向能容忍的绝对值
                var horizontalMax = (_this.props.imageWidth * _this.scale - _this.props.cropWidth) / 2 / _this.scale;
                if (_this.positionX < -horizontalMax) {
                  // 超越了左边临界点，还在继续向左移动
                  _this.positionX = -horizontalMax;
                  // 让其产生细微位移，偏离轨道
                  _this.horizontalWholeOuterCounter += -1 / 1e10;
                } else if (_this.positionX > horizontalMax) {
                  // 超越了右侧临界点，还在继续向右移动
                  _this.positionX = horizontalMax;
                  // 让其产生细微位移，偏离轨道
                  _this.horizontalWholeOuterCounter += 1 / 1e10;
                }
                _this.animatedPositionX.setValue(_this.positionX);
              } else {
                // 不能横向拖拽，全部算做溢出偏移量
                _this.horizontalWholeOuterCounter += diffX;
              }
              // 溢出量不会超过设定界限
              if (_this.horizontalWholeOuterCounter > (_this.props.maxOverflow || 0)) {
                _this.horizontalWholeOuterCounter = _this.props.maxOverflow || 0;
              } else if (_this.horizontalWholeOuterCounter < -(_this.props.maxOverflow || 0)) {
                _this.horizontalWholeOuterCounter = -(_this.props.maxOverflow || 0);
              }
              if (_this.horizontalWholeOuterCounter !== 0) {
                // 如果溢出偏移量不是0，执行溢出回调
                if (_this.props.horizontalOuterRangeOffset) {
                  _this.props.horizontalOuterRangeOffset(_this.horizontalWholeOuterCounter);
                }
              }
            }
            // 如果图片高度大于盒子高度， 可以纵向弹性拖拽
            if (_this.props.imageHeight * _this.scale > _this.props.cropHeight) {
              _this.positionY += diffY / _this.scale;
              _this.animatedPositionY.setValue(_this.positionY);
              // 如果图片上边缘脱离屏幕上边缘，则进入 swipeDown 动作
              // if (
              //   (this.props.imageHeight / 2 - this.positionY) * this.scale <
              //   this.props.cropHeight / 2
              // ) {
              //   if (this.props.enableSwipeDown) {
              //     this.swipeDownOffset += diffY
              //     // 只要滑动溢出量不小于 0，就可以拖动
              //     if (this.swipeDownOffset > 0) {
              //       this.positionY += diffY / this.scale
              //       this.animatedPositionY.setValue(this.positionY)
              //       // 越到下方，缩放越小
              //       this.scale = this.scale - diffY / 1000
              //       this.animatedScale.setValue(this.scale)
              //     }
              //   }
              // }
            } else {
              // swipeDown 不允许在已经有横向偏移量时触发
              if (_this.props.enableSwipeDown && !_this.isHorizontalWrap) {
                // 图片高度小于盒子高度，只能向下拖拽，而且一定是 swipeDown 动作
                _this.swipeDownOffset += diffY;
                // 只要滑动溢出量不小于 0，就可以拖动
                if (_this.swipeDownOffset > 0) {
                  _this.positionY += diffY / _this.scale;
                  _this.animatedPositionY.setValue(_this.positionY);
                  // 越到下方，缩放越小
                  _this.scale = _this.scale - diffY / 1000;
                  _this.animatedScale.setValue(_this.scale);
                }
              }
            }
          }
        } else if (evt.nativeEvent.touches.length > 1 && evt.nativeEvent.touches.length > 1) {
          // 多个手指的情况
          // 取消长按状态
          if (_this.longPressTimeout) {
            clearTimeout(_this.longPressTimeout);
          }
          if (_this.props.pinchToZoom) {
            // 找最小的 x 和最大的 x
            var minX = void 0;
            var maxX = void 0;
            if (evt.nativeEvent.touches[0].locationX > evt.nativeEvent.touches[1].locationX) {
              minX = evt.nativeEvent.touches[1].pageX;
              maxX = evt.nativeEvent.touches[0].pageX;
            } else {
              minX = evt.nativeEvent.touches[0].pageX;
              maxX = evt.nativeEvent.touches[1].pageX;
            }
            var minY = void 0;
            var maxY = void 0;
            if (evt.nativeEvent.touches[0].locationY > evt.nativeEvent.touches[1].locationY) {
              minY = evt.nativeEvent.touches[1].pageY;
              maxY = evt.nativeEvent.touches[0].pageY;
            } else {
              minY = evt.nativeEvent.touches[0].pageY;
              maxY = evt.nativeEvent.touches[1].pageY;
            }
            var widthDistance = maxX - minX;
            var heightDistance = maxY - minY;
            var diagonalDistance = Math.sqrt(widthDistance * widthDistance + heightDistance * heightDistance) * 2;
            _this.zoomCurrentDistance = Number(diagonalDistance.toFixed(1));
            if (_this.zoomLastDistance !== null) {
              var distanceDiff = (_this.zoomCurrentDistance - _this.zoomLastDistance) / 200;
              var zoom = _this.scale + distanceDiff;
              if (zoom < (_this.props.minScale || 0)) {
                zoom = _this.props.minScale || 0;
              }
              if (zoom > (_this.props.maxScale || 0)) {
                zoom = _this.props.maxScale || 0;
              }
              // 记录之前缩放比例
              var beforeScale = _this.scale;
              // 开始缩放
              _this.scale = zoom;
              _this.animatedScale.setValue(_this.scale);
              // 图片要慢慢往两个手指的中心点移动
              // 缩放 diff
              var diffScale = _this.scale - beforeScale;
              // 找到两手中心点距离页面中心的位移
              // 移动位置
              _this.positionX -= (_this.centerDiffX * diffScale) / _this.scale;
              _this.positionY -= (_this.centerDiffY * diffScale) / _this.scale;
              _this.animatedPositionX.setValue(_this.positionX);
              _this.animatedPositionY.setValue(_this.positionY);
            }
            _this.zoomLastDistance = _this.zoomCurrentDistance;
          }
        }
        _this.imageDidMove('onPanResponderMove');
      },
      onPanResponderRelease(evt, gestureState) {
        // 取消长按
        if (_this.longPressTimeout) {
          clearTimeout(_this.longPressTimeout);
        }
        // 双击结束，结束尾判断
        if (_this.isDoubleClick) {
          return;
        }
        // 长按结束，结束尾判断
        if (_this.isLongPress) {
          return;
        }
        // 如果是单个手指、距离上次按住大于预设秒、滑动距离小于预设值, 则可能是单击（如果后续双击间隔内没有开始手势）
        // const stayTime = new Date().getTime() - this.lastTouchStartTime!
        var moveDistance = Math.sqrt(gestureState.dx * gestureState.dx + gestureState.dy * gestureState.dy);
        var _a = evt.nativeEvent;
        var locationX = _a.locationX;
        var locationY = _a.locationY;
        var pageX = _a.pageX;
        var pageY = _a.pageY;
        if (evt.nativeEvent.changedTouches.length === 1 && moveDistance < (_this.props.clickDistance || 0)) {
          _this.singleClickTimeout = setTimeout(() => {
            if (_this.props.onClick) {
              _this.props.onClick({ locationX, locationY, pageX, pageY });
            }
          }, _this.props.doubleClickInterval);
        } else {
          // 多手势结束，或者滑动结束
          if (_this.props.responderRelease) {
            _this.props.responderRelease(gestureState.vx, _this.scale);
          }
          _this.panResponderReleaseResolve();
        }
      },
      onPanResponderTerminate() {
        //
      },
    });
    _this.resetScale = function () {
      _this.positionX = 0;
      _this.positionY = 0;
      _this.scale = _this.defaultScale;
      _this.animatedScale.setValue(_this.defaultScale);
    };
    _this.panResponderReleaseResolve = function () {
      // 判断是否是 swipeDown
      if (_this.props.enableSwipeDown && _this.props.swipeDownThreshold) {
        if (_this.swipeDownOffset > _this.props.swipeDownThreshold) {
          if (_this.props.onSwipeDown) {
            _this.props.onSwipeDown();
          }
          // Stop reset.
          return;
        }
      }
      if (_this.props.enableCenterFocus && _this.scale < _this.defaultScale) {
        // 如果缩放小于1，强制重置为 1
        _this.scale = _this.defaultScale;
        react_native_1.Animated.timing(_this.animatedScale, {
          toValue: _this.scale,
          duration: 100,
          useNativeDriver: !!_this.props.useNativeDriver,
        }).start();
      }
      if (_this.props.imageWidth * _this.scale <= _this.props.cropWidth) {
        // 如果图片宽度小于盒子宽度，横向位置重置
        _this.positionX = 0;
        react_native_1.Animated.timing(_this.animatedPositionX, {
          toValue: _this.positionX,
          duration: 100,
          useNativeDriver: !!_this.props.useNativeDriver,
        }).start();
      }
      if (_this.props.imageHeight * _this.scale <= _this.props.cropHeight) {
        // 如果图片高度小于盒子高度，纵向位置重置
        _this.positionY = 0;
        react_native_1.Animated.timing(_this.animatedPositionY, {
          toValue: _this.positionY,
          duration: 100,
          useNativeDriver: !!_this.props.useNativeDriver,
        }).start();
      }
      // 横向肯定不会超出范围，由拖拽时控制
      // 如果图片高度大于盒子高度，纵向不能出现黑边
      if (_this.props.imageHeight * _this.scale > _this.props.cropHeight) {
        // 纵向能容忍的绝对值
        var verticalMax = (_this.props.imageHeight * _this.scale - _this.props.cropHeight) / 2 / _this.scale;
        if (_this.positionY < -verticalMax) {
          _this.positionY = -verticalMax;
        } else if (_this.positionY > verticalMax) {
          _this.positionY = verticalMax;
        }
        react_native_1.Animated.timing(_this.animatedPositionY, {
          toValue: _this.positionY,
          duration: 100,
          useNativeDriver: !!_this.props.useNativeDriver,
        }).start();
      }
      if (_this.props.imageWidth * _this.scale > _this.props.cropWidth) {
        // 纵向能容忍的绝对值
        var horizontalMax = (_this.props.imageWidth * _this.scale - _this.props.cropWidth) / 2 / _this.scale;
        if (_this.positionX < -horizontalMax) {
          _this.positionX = -horizontalMax;
        } else if (_this.positionX > horizontalMax) {
          _this.positionX = horizontalMax;
        }
        react_native_1.Animated.timing(_this.animatedPositionX, {
          toValue: _this.positionX,
          duration: 100,
          useNativeDriver: !!_this.props.useNativeDriver,
        }).start();
      }
      // 拖拽正常结束后,如果没有缩放,直接回到0,0点
      if (_this.props.enableCenterFocus && _this.scale === _this.defaultScale) {
        _this.positionX = 0;
        _this.positionY = 0;
        react_native_1.Animated.timing(_this.animatedPositionX, {
          toValue: _this.positionX,
          duration: 100,
          useNativeDriver: !!_this.props.useNativeDriver,
        }).start();
        react_native_1.Animated.timing(_this.animatedPositionY, {
          toValue: _this.positionY,
          duration: 100,
          useNativeDriver: !!_this.props.useNativeDriver,
        }).start();
      }
      // 水平溢出量置空
      _this.horizontalWholeOuterCounter = 0;
      // swipeDown 溢出量置空
      _this.swipeDownOffset = 0;
      _this.imageDidMove('onPanResponderRelease');
    };
    return _this;
  }
  ImageViewer.prototype.componentDidMount = function () {
    if (this.props.centerOn) {
      this.centerOn(this.props.centerOn);
    }
    this.scale = this.defaultScale;
    this.animatedScale.setValue(this.scale);
  };
  ImageViewer.prototype.componentDidUpdate = function (prevProps) {
    // Either centerOn has never been called, or it is a repeat and we should ignore it
    if (
      (this.props.centerOn && !prevProps.centerOn) ||
      (this.props.centerOn && prevProps.centerOn && this.didCenterOnChange(prevProps.centerOn, this.props.centerOn))
    ) {
      this.centerOn(this.props.centerOn);
    }
  };
  ImageViewer.prototype.imageDidMove = function (type) {
    if (this.props.onMove) {
      this.props.onMove({
        type,
        positionX: this.positionX,
        positionY: this.positionY,
        scale: this.scale,
        zoomCurrentDistance: this.zoomCurrentDistance,
      });
    }
  };
  ImageViewer.prototype.didCenterOnChange = function (params, paramsNext) {
    return params.x !== paramsNext.x || params.y !== paramsNext.y || params.scale !== paramsNext.scale;
  };
  ImageViewer.prototype.centerOn = function (params) {
    var _this = this;
    this.positionX = params.x;
    this.positionY = params.y;
    this.scale = params.scale;
    var duration = params.duration || 300;
    react_native_1.Animated.parallel([
      react_native_1.Animated.timing(this.animatedScale, {
        toValue: this.scale,
        duration,
        useNativeDriver: !!this.props.useNativeDriver,
      }),
      react_native_1.Animated.timing(this.animatedPositionX, {
        toValue: this.positionX,
        duration,
        useNativeDriver: !!this.props.useNativeDriver,
      }),
      react_native_1.Animated.timing(this.animatedPositionY, {
        toValue: this.positionY,
        duration,
        useNativeDriver: !!this.props.useNativeDriver,
      }),
    ]).start(() => {
      _this.imageDidMove('centerOn');
    });
  };
  /**
   * 图片区域视图渲染完毕
   */
  ImageViewer.prototype.handleLayout = function (event) {
    if (this.props.layoutChange) {
      this.props.layoutChange(event);
    }
  };
  /**
   * 重置大小和位置
   */
  ImageViewer.prototype.reset = function () {
    this.scale = this.defaultScale;
    this.animatedScale.setValue(this.scale);
    this.positionX = 0;
    this.animatedPositionX.setValue(this.positionX);
    this.positionY = 0;
    this.animatedPositionY.setValue(this.positionY);
  };
  ImageViewer.prototype.render = function () {
    var animateConf = {
      transform: [
        {
          scale: this.animatedScale,
        },
        {
          translateX: this.animatedPositionX,
        },
        {
          translateY: this.animatedPositionY,
        },
      ],
    };
    var parentStyles = react_native_1.StyleSheet.flatten(this.props.style);
    return (
      <react_native_1.View
        style={__assign(__assign(__assign({}, image_zoom_style_1.default.container), parentStyles), {
          width: this.props.cropWidth,
          height: this.props.cropHeight,
        })}
        {...this.imagePanResponder.panHandlers}
      >
        <react_native_1.Animated.View
          style={animateConf}
          renderToHardwareTextureAndroid={this.props.useHardwareTextureAndroid}
        >
          <react_native_1.View
            onLayout={this.handleLayout.bind(this)}
            style={{
              width: this.props.imageWidth,
              height: this.props.imageHeight,
            }}
          >
            {this.props.children}
          </react_native_1.View>
        </react_native_1.Animated.View>
      </react_native_1.View>
    );
  };
  ImageViewer.defaultProps = new image_zoom_type_1.ImageZoomProps();
  return ImageViewer;
})(React.Component);
exports.default = ImageViewer;
// # sourceMappingURL=image-zoom.component.js.map
