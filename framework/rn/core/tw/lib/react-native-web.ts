import type { ClassName } from '@/rn/core/tw/class-name'
import { clsx } from '@/rn/core/tw/clsx'
import { tw } from '@/rn/core/tw/tw'
import type { StrMap } from '@/shared/ts-utils'

type Common = {
  className?: ClassName
  pointerEvents?: 'auto' | 'box-none' | 'box-only' | 'none'
  writingDirection?: 'ltr' | 'rtl'
}
type Text = Common &
  Partial<{
    // hasTextAncestor is disabled to make sure server variant will render the same markup
    // we will need to handle writingDirection manually
    // it will be passed as undefined
    hasTextAncestor: boolean
    // numberOfLines should be transpiled using class name `line-clamp-<number>`
    // on web we should handle max width, wrap, overflow, ellipsis
    // it will be passed as undefined
    numberOfLines: number
    // selectable should be transpiled using class name `select-text` or `select-none`
    // it will be passed as undefined
    selectable: boolean
    // pressable is converted from onPress, it it is present it should be in the client bundle
    pressable: boolean
  }>
type View = Common &
  Partial<{
    // hasTextAncestor is disabled to make sure server variant will render the same markup
    // it will be passed as undefined
    hasTextAncestor: boolean
  }>
type Pressable = Common &
  Partial<{
    disabled: boolean
  }>
type ScrollView = Common &
  Partial<{
    stickyHeader: boolean
    pagingEnabledChild: boolean
    contentContainerCenterContent: boolean
    pagingEnabledHorizontal: boolean
    pagingEnabledVertical: boolean
    base: boolean
    baseHorizontal: boolean
    baseVertical: boolean
  }>
type TextInput = Common &
  Partial<{
    // placeholderTextColor should be transpiled using class name `placeholder-<color>`
    // it will be passed as undefined
    placeholderTextColor: string
    // caretHidden should be transpiled using class name `caret-transparent`
    // it will be passed as undefined
    caretHidden: boolean
  }>
type FlatList = Common &
  Partial<{
    columnWrapper: boolean
  }>

// use tw`` here to collect and map when class names are minified
const map: StrMap<Function> = {
  Text: (d: Text) => [
    tw`relative m-0 inline list-none border-0 border-solid border-black bg-transparent p-0 text-start font-sans text-sm wrap-break-word whitespace-pre-wrap text-black no-underline`,
    d.hasTextAncestor && tw`whitespace-[inherit] font-[inherit] text-inherit`,
    d.numberOfLines === 1 &&
      tw`max-w-full overflow-hidden wrap-normal text-ellipsis whitespace-nowrap`,
    // `line-clamp-<number>` should be transpiled as describe above
    d.numberOfLines &&
      d.numberOfLines > 1 &&
      tw`max-w-full overflow-clip text-ellipsis`,
    d.selectable === false ? tw`select-none` : tw`select-text`,
    d.pressable && tw`cursor-pointer`,
  ],
  View: (d: View) => [
    tw`m-h-0 m-w-0 relative z-0 m-0 flex shrink-0 basis-auto list-none flex-col content-start items-stretch border-0 border-solid border-black bg-transparent p-0 no-underline`,
    d.hasTextAncestor && tw`inline-flex`,
  ],
  Pressable: (d: Pressable) => [
    !d.disabled
      ? tw`cursor-pointer touch-manipulation`
      : tw`pointer-events-none`,
  ],
  ScrollView: (d: ScrollView) => [
    d.stickyHeader && tw`sticky top-0 z-10`,
    d.pagingEnabledChild && tw`snap-start`,
    d.contentContainerCenterContent && tw`grow justify-center`,
    d.pagingEnabledHorizontal && tw`snap-x snap-mandatory`,
    d.pagingEnabledVertical && tw`snap-y snap-mandatory`,
    d.base && tw`shrink grow transform-[translateZ(0)]`,
    d.baseHorizontal && tw`flex-col overflow-x-hidden overflow-y-auto`,
    d.baseHorizontal && tw`flex-row overflow-x-auto overflow-y-hidden`,
  ],
  TextInput: (d: TextInput) => [
    tw`rounded-0 font-sm m-0 resize-none [appearance:textfield] border-0 border-solid border-black bg-transparent p-0 font-sans outline-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`,
    // `placeholder-<color>` should be transpiled as describe above
    d.caretHidden && tw`caret-transparent`,
  ],
  FlatList: (d: FlatList) => [d.columnWrapper && tw`flex-row`],
}

// sort to preserve order
const order: StrMap<number> = {
  Text: 0,
  View: 0,
  Pressable: 1,
  ScrollView: 2,
  TextInput: 0,
  FlatList: 3,
}
export const rnwClassName = (d: any, o: Common) => {
  const arr = Object.keys(d)
    .sort((a, b) => order[a] - order[b])
    .map(k => map[k](d[k]))
  return clsx(
    arr,
    o.pointerEvents === 'auto' && 'pointer-events-auto',
    o.pointerEvents === 'none' && 'pointer-events-none',
    o.className,
  )
}
