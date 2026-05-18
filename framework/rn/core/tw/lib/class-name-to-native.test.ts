import { describe, expect, it } from 'vitest'

import { createTwrnc } from '@/devtools/babel-plugin-tw/lib/create-twrnc'
import { classNameToNative } from '@/rn/core/tw/lib/class-name-to-native'
import { twrncConfig } from '@/rn/core/twrnc-config'

const e = (className: string, expectedValue: any) => {
  const v = classNameToNative({
    platform: 'android',
    className,
    twrnc: createTwrnc('android', twrncConfig),
  })
  return expect(v).toEqual(expectedValue)
}

describe('classNameToNative', () => {
  // basic twrnc
  it('text-red-500', () => e('text-red-500', { color: '#ef4444' }))
  it('flex', () => e('flex', { display: 'flex' }))
  it('flex-col', () => e('flex-col', { flexDirection: 'column' }))
  it('flex-row', () => e('flex-row', { flexDirection: 'row' }))
  it('items-center', () => e('items-center', { alignItems: 'center' }))
  it('justify-between', () =>
    e('justify-between', {
      justifyContent: 'space-between',
    }))
  it('p-4', () =>
    e('p-4', {
      paddingTop: 16,
      paddingBottom: 16,
      paddingLeft: 16,
      paddingRight: 16,
    }))
  it('mt-2', () => e('mt-2', { marginTop: 8 }))
  it('w-full', () => e('w-full', { width: '100%' }))
  it('h-10', () => e('h-10', { height: 40 }))
  it('rounded-lg', () => e('rounded-lg', { borderRadius: 8 }))
  it('font-bold', () => e('font-bold', { fontWeight: 'bold' }))
  it('text-lg', () => e('text-lg', { fontSize: 18, lineHeight: 28 }))
  it('opacity-50', () => e('opacity-50', { opacity: 0.5 }))
  it('overflow-hidden', () => e('overflow-hidden', { overflow: 'hidden' }))
  it('z-10', () => e('z-10', { zIndex: 10 }))
  it('-z-10', () => e('-z-10', { zIndex: -10 }))
  it('z-[999]', () => e('z-[999]', { zIndex: 999 }))
  it('-z-[999]', () => e('-z-[999]', { zIndex: -999 }))

  // platform strip on native (omitEmptyClassName returns undefined for empty objects)
  it('web: stripped on native', () => e('web:flex', undefined))
  it('hover: stripped on native', () => e('hover:flex', undefined))
  it('group-hover: stripped on native', () => e('group-hover:flex', undefined))
  it('peer-hover: stripped on native', () => e('peer-hover:flex', undefined))
  it('cursor-pointer stripped on native', () => e('cursor-pointer', undefined))
  it('theme- stripped on native', () => e('theme-dark', undefined))

  // platform selectors
  it('android: matches android', () =>
    e('android:flex', {
      selector: true,
      style: { display: 'flex' },
    }))
  it('ios: stripped on android', () => e('ios:flex', undefined))
  it('native: matches android', () =>
    e('native:flex', {
      selector: true,
      style: { display: 'flex' },
    }))

  // selectors (dark, active, focus, disabled, sm, etc.)
  it('dark:', () =>
    e('dark:text-red-500', {
      selector: 'dark',
      style: { color: '#ef4444' },
    }))
  it('light:', () =>
    e('light:text-red-500', {
      selector: 'light',
      style: { color: '#ef4444' },
    }))
  it('active:', () =>
    e('active:opacity-50', {
      selector: 'active',
      style: { opacity: 0.5 },
    }))
  it('focus:', () =>
    e('focus:opacity-50', {
      selector: 'focus',
      style: { opacity: 0.5 },
    }))
  it('disabled:', () =>
    e('disabled:opacity-50', {
      selector: 'disabled',
      style: { opacity: 0.5 },
    }))
  it('checked:', () =>
    e('checked:opacity-50', {
      selector: 'checked',
      style: { opacity: 0.5 },
    }))
  it('sm:', () =>
    e('sm:flex', {
      selector: 'sm',
      style: { display: 'flex' },
    }))
  it('md:', () =>
    e('md:flex', {
      selector: 'md',
      style: { display: 'flex' },
    }))

  // group / peer
  it('group marker', () =>
    e('group', {
      selector: 'group',
      style: { '': true },
    }))
  it('peer marker', () =>
    e('peer', {
      selector: 'peer',
      style: { '': true },
    }))
  it('peer-focus: selector', () =>
    e('peer-focus:opacity-50', {
      selector: 'peer-focus',
      style: { opacity: 0.5 },
    }))

  // transition
  it('transition', () =>
    e('transition', {
      transitionProperty: '',
      transitionDuration: 150,
      transitionTimingFunction: 'ease-in-out',
    }))
  it('transition-all', () =>
    e('transition-all', {
      transitionProperty: 'all',
      transitionDuration: 150,
      transitionTimingFunction: 'ease-in-out',
    }))
  it('transition-colors', () =>
    e('transition-colors', {
      transitionProperty: 'colors',
      transitionDuration: 150,
      transitionTimingFunction: 'ease-in-out',
    }))
  it('transition-opacity', () =>
    e('transition-opacity', {
      transitionProperty: 'opacity',
      transitionDuration: 150,
      transitionTimingFunction: 'ease-in-out',
    }))
  it('transition-shadow', () =>
    e('transition-shadow', {
      transitionProperty: 'shadow',
      transitionDuration: 150,
      transitionTimingFunction: 'ease-in-out',
    }))
  it('transition-transform', () =>
    e('transition-transform', {
      transitionProperty: 'transform',
      transitionDuration: 150,
      transitionTimingFunction: 'ease-in-out',
    }))
  it('transition-none', () =>
    e('transition-none', {
      transitionProperty: 'none',
      transitionDuration: 150,
      transitionTimingFunction: 'ease-in-out',
    }))
  it('transition-[opacity,transform]', () =>
    e('transition-[opacity,transform]', {
      transitionProperty: ['opacity', 'transform'],
      transitionDuration: 150,
      transitionTimingFunction: 'ease-in-out',
    }))
  it('duration-300', () => e('duration-300', { transitionDuration: 300 }))
  it('duration-initial', () => e('duration-initial', { transitionDuration: 0 }))
  it('ease-linear', () =>
    e('ease-linear', {
      transitionTimingFunction: 'linear',
    }))
  it('ease-in', () =>
    e('ease-in', {
      transitionTimingFunction: 'ease-in',
    }))
  it('ease-out', () =>
    e('ease-out', {
      transitionTimingFunction: 'ease-out',
    }))
  it('ease-in-out', () =>
    e('ease-in-out', {
      transitionTimingFunction: 'ease-in-out',
    }))
  it('ease-initial', () =>
    e('ease-initial', {
      transitionTimingFunction: 'ease',
    }))
  it('delay-100', () => e('delay-100', { transitionDelay: 100 }))

  // transition shorthand
  it('translate-', () => e('translate-x-1', { transform: [{ translateX: 4 }] }))
  it('rotate-', () =>
    e('rotate-[180deg]', { transform: [{ rotate: '180deg' }] }))
  it('scale-', () => e('scale-50', { transform: [{ scale: 0.5 }] }))

  // animation
  it('animate-spin', () => e('animate-spin', { animationName: 'spin' }))
  it('animate-ping', () => e('animate-ping', { animationName: 'ping' }))
  it('animate-pulse', () => e('animate-pulse', { animationName: 'pulse' }))
  it('animate-bounce', () => e('animate-bounce', { animationName: 'bounce' }))

  // grid
  it('grid', () => e('grid', { grid: true }))
  it('grid-cols-none', () => e('grid-cols-none', { gridCols: undefined }))
  it('grid-cols-3', () => e('grid-cols-3', { gridCols: 3 }))
  it('grid-cols-[100px_1fr]', () =>
    e('grid-cols-[100px_1fr]', {
      gridCols: [{ px: 100 }, { fr: 1 }],
    }))

  // line clamp
  it('line-clamp-2', () => e('line-clamp-2', { numberOfLines: 2 }))
  it('line-clamp-none', () =>
    e('line-clamp-none', { numberOfLines: undefined }))

  // selectable
  it('select-text', () => e('select-text', { selectable: true }))
  it('select-none', () => e('select-none', { selectable: false }))

  // placeholder
  it('placeholder-red-500', () =>
    e('placeholder-red-500', {
      placeholderTextColor: '#ef4444',
    }))

  // caret
  it('caret-transparent', () => e('caret-transparent', { caretHidden: true }))

  // object fit
  it('object-contain', () => e('object-contain', { resizeMode: 'contain' }))
  it('object-cover', () => e('object-cover', { resizeMode: 'cover' }))
  it('object-fill', () => e('object-fill', { resizeMode: 'fill' }))
  it('object-none', () => e('object-none', { resizeMode: 'none' }))
  it('object-scale-down', () =>
    e('object-scale-down', { resizeMode: 'scale-down' }))

  // variable
  it('variable', () =>
    e('text-primary', { variable: '--primary-500', key: 'color' }))

  // alpha
  it('alpha builtin', () =>
    e('text-red-500/50', { color: 'rgba(239, 68, 68, 0.5)' }))
  it('alpha variable', () =>
    e('text-primary/50', {
      variable: '--primary-500',
      alpha: 0.5,
      key: 'color',
    }))
})
