import * as React from 'react'

import type { IImageInfo, Props, State } from './image-viewer.type'

export default class ImageViewer extends React.Component<Props, State> {
  static defaultProps: Props
  state: State
  private fadeAnim
  private standardPositionX
  private positionXNumber
  private positionX
  private width
  private height
  private styles
  private hasLayout
  private loadedIndex
  private handleLongPressWithIndex
  private imageRefs
  componentDidMount(): void
  static getDerivedStateFromProps(
    nextProps: Props,
    prevState: State,
  ): {
    currentShowIndex: number | undefined
    prevIndexProp: number | undefined
  } | null
  componentDidUpdate(prevProps: Props, prevState: State): void
  /**
   * props 有变化时执行
   */
  init(nextProps: Props): void
  /**
   * reset Image scale and position
   */
  resetImageByIndex: (index: number) => void
  /**
   * 调到当前看图位置
   */
  jumpToCurrentImage(): void
  /**
   * 加载图片，主要是获取图片长与宽
   */
  loadImage(index: number): void
  /**
   * 预加载图片
   */
  preloadImage: (index: number) => void
  /**
   * 触发溢出水平滚动
   */
  handleHorizontalOuterRangeOffset: (offsetX?: number) => void
  /**
   * 手势结束，但是没有取消浏览大图
   */
  handleResponderRelease: (vx: number | undefined, scale: number) => void
  /**
   * 到上一张
   */
  goBack: () => void
  /**
   * 到下一张
   */
  goNext: () => void
  /**
   * 回到原位
   */
  resetPosition(): void
  /**
   * 长按
   */
  handleLongPress: (image: IImageInfo) => void
  /**
   * 单击
   */
  handleClick: () => void
  /**
   * 双击
   */
  handleDoubleClick: () => void
  /**
   * 退出
   */
  handleCancel: () => void
  /**
   * 完成布局
   */
  handleLayout: (event: any) => void
  /**
   * 获得整体内容
   */
  getContent(): JSX.Element
  /**
   * 保存当前图片到本地相册
   */
  saveToLocal: () => void
  getMenu(): JSX.Element | null
  handleLeaveMenu: () => void
  handleSwipeDown: () => void
  render(): JSX.Element
}
