'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Drawer } from '@/rn/components/drawer'
import { Dropdown } from '@/rn/components/dropdown'
import { inputCva } from '@/rn/components/input/input-cva'
import type {
  ItemsFn,
  SearchStrategy,
  SelectItem,
  SelectProps,
} from '@/rn/components/select/select-cva'
import { selectCva } from '@/rn/components/select/select-cva'
import { Span } from '@/rn/components/text'
import { Input } from '@/rn/core/components/input'
import { Pressable } from '@/rn/core/components/pressable'
import { View } from '@/rn/core/components/view'
import { useWindowDimensions } from '@/rn/core/responsive/use-window-dimensions'
import { useControllableState } from '@/rn/core/utils/use-controllable-state'
import { Check } from '@/rn/svg-icons/check'
import { ChevronBottom } from '@/rn/svg-icons/chevron-bottom'

export type {
  SelectItem,
  SelectItems,
  SelectProps,
} from '@/rn/components/select/select-cva'

// --- pure helpers ---

// -- segments --

type Segment = { text: string; hl: boolean }

const buildSegments = (
  label: string,
  ranges: [number, number][],
): Segment[] => {
  if (ranges.length === 0) {
    return [{ text: label, hl: false }]
  }
  const segs: Segment[] = []
  let cursor = 0
  for (const [start, end] of ranges) {
    if (cursor < start) {
      segs.push({ text: label.slice(cursor, start), hl: false })
    }
    segs.push({ text: label.slice(start, end), hl: true })
    cursor = end
  }
  if (cursor < label.length) {
    segs.push({ text: label.slice(cursor), hl: false })
  }
  return segs
}

const mergeRanges = (ranges: [number, number][]): [number, number][] => {
  const sorted = [...ranges].sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = []
  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1]
    if (last && start <= last[1]) {
      last[1] = Math.max(last[1], end)
    } else {
      merged.push([start, end])
    }
  }
  return merged
}

// -- search matching --

// Tries to match each char of token against the first char of a distinct word.
// Modifies usedWords in-place only on success.
// "usa" on "United States of America" -> [[0,1],[7,8],[17,18]]
const tryAcronym = (
  label: string,
  words: [number, number][],
  token: string,
  usedWords: Set<number>,
): [number, number][] | null => {
  const tempUsed = new Set(usedWords)
  const ranges: [number, number][] = []
  for (const char of token) {
    let found = false
    for (let i = 0; i < words.length; i++) {
      if (tempUsed.has(i)) {
        continue
      }
      if (label[words[i][0]].toLowerCase() === char) {
        ranges.push([words[i][0], words[i][0] + 1])
        tempUsed.add(i)
        found = true
        break
      }
    }
    if (!found) {
      return null
    }
  }
  for (const i of tempUsed) {
    usedWords.add(i)
  }
  return ranges
}

const DEFAULT_STRATEGIES: SearchStrategy[] = [
  'word-prefix',
  'acronym',
  'contains',
  'value',
]

// Per token: tries enabled strategies in priority order (word-prefix > acronym > contains).
// All tokens must match. Ranges from all strategies are merged.
// "a b"  on "United States"           -> word-prefix [[0,1],[7,8]]
// "usa"  on "United States of America" -> acronym [[0,1],[7,8],[17,18]]
// "an b" on "Apple Banana"            -> "an" contains [[7,9]], "b" word-prefix [[6,7]] -> [[6,9]]
const matchLabel = (
  label: string,
  query: string,
  s: Set<SearchStrategy>,
): [number, number][] | null => {
  const tokens = query.trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) {
    return []
  }
  const words: [number, number][] = []
  const re = /\S+/g
  let m: RegExpExecArray | null
  while ((m = re.exec(label)) !== null) {
    words.push([m.index, m.index + m[0].length])
  }
  const usedWords = new Set<number>()
  const ranges: [number, number][] = []
  for (const token of tokens) {
    const lower = token.toLowerCase()
    let matched = false
    if (s.has('word-prefix')) {
      for (let i = 0; i < words.length; i++) {
        if (usedWords.has(i)) {
          continue
        }
        if (
          label.slice(words[i][0], words[i][1]).toLowerCase().startsWith(lower)
        ) {
          usedWords.add(i)
          ranges.push([words[i][0], words[i][0] + token.length])
          matched = true
          break
        }
      }
    }
    if (!matched && s.has('acronym') && token.length > 1) {
      const acronymRanges = tryAcronym(label, words, lower, usedWords)
      if (acronymRanges) {
        ranges.push(...acronymRanges)
        matched = true
      }
    }
    if (!matched && s.has('contains')) {
      const idx = label.toLowerCase().indexOf(lower)
      if (idx !== -1) {
        ranges.push([idx, idx + token.length])
        matched = true
      }
    }
    if (!matched) {
      return null
    }
  }
  return mergeRanges(ranges)
}

// Returns label highlight ranges, [] (no highlight) if matched via value, or null on miss.
const matchItem = (
  item: SelectItem,
  query: string,
  s: Set<SearchStrategy>,
): [number, number][] | null => {
  const labelRanges = matchLabel(item.label, query, s)
  if (labelRanges !== null) {
    return labelRanges
  }
  if (s.has('value')) {
    const valueS = new Set(s)
    valueS.delete('value')
    return matchLabel(item.value, query, valueS) !== null ? [] : null
  }
  return null
}

// For local filter or remote with defaultHighlightSearch: word-prefix token matching.
// For remote without defaultHighlightSearch: use server-provided item.highlight ranges.
const getSegments = (
  item: SelectItem,
  query: string,
  isRemote: boolean,
  defaultHighlightSearch: boolean,
  s: Set<SearchStrategy>,
): Segment[] => {
  if (isRemote && !defaultHighlightSearch) {
    return buildSegments(item.label, mergeRanges(item.highlight || []))
  }
  if (!query) {
    return [{ text: item.label, hl: false }]
  }
  const ranges = matchItem(item, query, s)
  if (!ranges || ranges.length === 0) {
    return [{ text: item.label, hl: false }]
  }
  return buildSegments(item.label, ranges)
}

// --- component ---

export const Select = ({
  multiple,
  appearance = 'outlined',
  size = 'md',
  shape = 'rounded',
  disabled,
  items,
  placeholder = 'Select an option',
  title,
  doneLabel = 'Done',
  loadingLabel = 'Loading...',
  emptyLabel = 'No results',
  invalid,
  searchable,
  searchPlaceholder = 'Search...',
  searchStrategies = DEFAULT_STRATEGIES,
  onSearch,
  defaultHighlightSearch = false,
  value,
  defaultValue,
  onChange,
  className,
}: SelectProps) => {
  // -- open state --

  const [active, setActive] = useState(false)
  const [query, setQuery] = useState('')
  const [reference, setReference] = useState<any>(null)
  const setRef = useCallback((el: any) => setReference(el), [])

  useEffect(() => {
    if (disabled) {
      setActive(false)
      setQuery('')
    }
  }, [disabled])

  // -- async items --

  const [asyncItems, setAsyncItems] = useState<SelectItem[]>([])
  const [loading, setLoading] = useState(false)
  const requestIdRef = useRef(0)

  const isItemsFn = typeof items === 'function'
  const resolvedItems = isItemsFn ? asyncItems : (items as SelectItem[])

  const openItems = () => {
    if (!isItemsFn) {
      return
    }
    const id = ++requestIdRef.current
    const result = (items as ItemsFn)()
    if (result instanceof Promise) {
      setLoading(true)
      result
        .then(data => {
          if (id === requestIdRef.current) {
            setAsyncItems(data)
          }
        })
        .catch(() => {})
        .finally(() => {
          if (id === requestIdRef.current) {
            setLoading(false)
          }
        })
    } else {
      setAsyncItems(result)
    }
  }

  // -- value state --

  const [state, setState] = useControllableState<string | string[]>({
    value: value as any,
    defaultValue: defaultValue || (multiple ? [] : ''),
    onChange: onChange as any,
  })

  // -- derived --

  const dimensions = useWindowDimensions()
  const useDropdown = dimensions && dimensions.width >= 640
  const isSearchable = searchable || !!onSearch
  const strategySet = useMemo(
    () => new Set(searchStrategies),
    [searchStrategies],
  )

  const itemMap = useMemo(
    () => new Map(resolvedItems.map(i => [i.value, i.label])),
    [resolvedItems],
  )
  const selectedSet = useMemo(() => {
    if (!multiple) {
      return new Set(state ? [state as string] : [])
    }
    return new Set(Array.isArray(state) ? (state as string[]) : [])
  }, [multiple, state])

  const triggerLabel = useMemo(() => {
    if (!multiple) {
      return itemMap.get(state as string) || ''
    }
    const arr = Array.isArray(state) ? state : []
    if (arr.length === 0) {
      return ''
    }
    return arr.map(v => itemMap.get(v) || v).join(', ')
  }, [multiple, state, itemMap])

  const filteredItems = useMemo(() => {
    if (!isSearchable || onSearch || !query) {
      return resolvedItems
    }
    return resolvedItems.filter(i => matchItem(i, query, strategySet) !== null)
  }, [isSearchable, onSearch, query, resolvedItems, strategySet])

  // -- handlers --

  const handleOpen = () => {
    setActive(true)
    openItems()
  }

  const handleClose = () => {
    setActive(false)
    setQuery('')
  }

  const handleSelect = (item: SelectItem) => {
    if (!multiple) {
      setState(item.value)
      handleClose()
      return
    }
    setState(prev => {
      const arr = Array.isArray(prev) ? prev : []
      return arr.includes(item.value)
        ? arr.filter(v => v !== item.value)
        : [...arr, item.value]
    })
  }

  // -- styles --

  const fieldCn = inputCva({
    appearance,
    size,
    shape,
    disabled,
    invalid,
    active,
  })
  const cn = selectCva({ size })

  // -- fragments --

  const renderItemLabel = (item: SelectItem, sel: boolean) => {
    const segments = getSegments(
      item,
      query,
      !!onSearch,
      defaultHighlightSearch,
      strategySet,
    )
    const hasHighlight = segments.some(s => s.hl)
    return (
      <Span className={[cn.itemLabel, sel && cn.itemLabelActive]}>
        {hasHighlight
          ? segments.map((seg, i) =>
              seg.hl ? (
                <Span key={i} className={cn.itemLabelHighlight}>
                  {seg.text}
                </Span>
              ) : (
                seg.text
              ),
            )
          : item.label}
      </Span>
    )
  }

  const titleJsx = !useDropdown && title && (
    <View className={cn.titleBar}>
      <Span className={cn.titleText}>{title}</Span>
    </View>
  )
  const searchJsx = isSearchable && (
    <View className={cn.searchBar}>
      <Input
        className={cn.searchInput}
        value={query}
        onChangeText={text => {
          setQuery(text)
          onSearch?.(text)
        }}
        placeholder={searchPlaceholder}
        autoCorrect={false}
        autoCapitalize='none'
      />
    </View>
  )
  const itemsJsx = loading ? (
    <Span className={cn.statusText}>{loadingLabel}</Span>
  ) : filteredItems.length === 0 ? (
    <Span className={cn.statusText}>{emptyLabel}</Span>
  ) : (
    filteredItems.map(item => {
      const sel = selectedSet.has(item.value)
      return (
        <Pressable
          key={item.value}
          onPress={() => handleSelect(item)}
          className={[cn.item, sel && cn.itemActive]}
        >
          {renderItemLabel(item, sel)}
          {sel && <Check className={cn.itemCheck} />}
        </Pressable>
      )
    })
  )
  const doneBtnJsx = multiple && (
    <View className={cn.doneBar}>
      <Pressable className={cn.doneBtn} onPress={handleClose}>
        <Span className={cn.doneBtnLabel}>{doneLabel}</Span>
      </Pressable>
    </View>
  )

  return (
    <>
      <Pressable
        ref={setRef}
        disabled={disabled}
        onPress={handleOpen}
        className={[fieldCn.container, cn.trigger, className]}
        renderToHardwareTextureAndroid={disabled}
        shouldRasterizeIOS={disabled}
      >
        <Span
          className={
            triggerLabel
              ? [fieldCn.label, cn.label]
              : [fieldCn.placeholder, cn.placeholder]
          }
        >
          {triggerLabel || placeholder}
        </Span>
        <ChevronBottom className={fieldCn.chevron} />
      </Pressable>
      {!disabled &&
        (useDropdown ? (
          <Dropdown open={active} onClose={handleClose} reference={reference}>
            {searchJsx}
            <Dropdown.ScrollView>{itemsJsx}</Dropdown.ScrollView>
            {doneBtnJsx}
          </Dropdown>
        ) : (
          <Drawer
            open={active}
            onClose={handleClose}
            contentContainerClassName='pb-8'
          >
            {titleJsx}
            {searchJsx}
            {itemsJsx}
            {doneBtnJsx}
          </Drawer>
        ))}
    </>
  )
}
