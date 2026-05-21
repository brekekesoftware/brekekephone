import { ThemeVariables } from "@/rn/core/twrnc-config"

// The framework has a configuration to load variables automatically using
// .extract-variables.scss but it is difficult to setup with craco react-scripts here.
// To make it simple, we extract variables manually here.
// Any change here also need to be made in ./brekeke.scss

export const variables: ThemeVariables = {
  '--background': '#ffffff',
  '--foreground': '#000000',
  '--foreground-muted': '#404040',
  '--foreground-subtle': '#808080',
  '--foreground-disabled': '#b3b3b3',
  '--foreground-inverse': '#ffffff',

  '--muted': '#f2f2f2',
  '--subtle': '#fafafa',

  '--border': '#d9d9d9',
  '--border-subtle': '#f2f2f2',
  '--border-strong': '#404040',

  '--card': '#ffffff',
  '--card-border': '#d9d9d9',

  '--modal': '#ffffff',
  '--modal-overlay': 'rgba(0, 0, 0, 0.8)',

  '--surface': '#ffffff',
  '--surface-raised': '#ffffff',

  '--ring': '#609b3a',

  '--primary-50': '#f7faf4',
  '--primary-100': '#ecf4e6',
  '--primary-200': '#d5e8c9',
  '--primary-300': '#b4d69e',
  '--primary-400': '#90c270',
  '--primary-500': '#609b3a',
  '--primary-600': '#50852e',
  '--primary-700': '#3e6623',
  '--primary-800': '#2e4c1a',
  '--primary-900': '#203512',
  '--primary-950': '#121e0a',

  '--secondary-50': '#f5f7fa',
  '--secondary-100': '#e8ecf3',
  '--secondary-200': '#cdd7e4',
  '--secondary-300': '#a5b6cf',
  '--secondary-400': '#7a94b8',
  '--secondary-500': '#64748b',
  '--secondary-600': '#48566a',
  '--secondary-700': '#384252',
  '--secondary-800': '#29313d',
  '--secondary-900': '#1d222b',
  '--secondary-950': '#101418',

  '--info-50': '#f2fbfc',
  '--info-100': '#e2f5f9',
  '--info-200': '#c0e9f1',
  '--info-300': '#8ed7e6',
  '--info-400': '#58c4da',
  '--info-500': '#4ac5de',
  '--info-600': '#19849a',
  '--info-700': '#136677',
  '--info-800': '#0e4b58',
  '--info-900': '#0a353d',
  '--info-950': '#061e23',

  '--success-50': '#f2fcf6',
  '--success-100': '#e1f9ea',
  '--success-200': '#c0f2d2',
  '--success-300': '#8de7ae',
  '--success-400': '#56dc87',
  '--success-500': '#22c55e',
  '--success-600': '#189b48',
  '--success-700': '#127737',
  '--success-800': '#0d5929',
  '--success-900': '#093e1d',
  '--success-950': '#052310',

  '--warning-50': '#fefaf1',
  '--warning-100': '#fcf3de',
  '--warning-200': '#f9e4b9',
  '--warning-300': '#f3cf81',
  '--warning-400': '#eeb844',
  '--warning-500': '#f1af20',
  '--warning-600': '#aa7709',
  '--warning-700': '#835c07',
  '--warning-800': '#614405',
  '--warning-900': '#443004',
  '--warning-950': '#271b02',

  '--error-50': '#fef1f4',
  '--error-100': '#fcdee4',
  '--error-200': '#f8b9c6',
  '--error-300': '#f38299',
  '--error-400': '#ed4567',
  '--error-500': '#dc0f39',
  '--error-600': '#aa092a',
  '--error-700': '#830720',
  '--error-800': '#610518',
  '--error-900': '#440411',
  '--error-950': '#27020a',
}

export const darkVariables: Partial<ThemeVariables> = {
  '--background': '#141c28',
  '--subtle': '#1a2436',
  '--muted': '#222c3c',

  '--foreground': '#f0f3f7',
  '--foreground-muted': '#94a3b8',
  '--foreground-subtle': '#64748b',
  '--foreground-disabled': '#334155',
  '--foreground-inverse': '#0f172a',

  '--border': '#2d3a4f',
  '--border-subtle': '#222c3c',
  '--border-strong': '#475569',

  '--card': '#1a2436',
  '--card-border': '#2d3a4f',

  '--modal': '#1a2436',
  '--modal-overlay': 'rgba(0, 0, 0, 0.7)',

  '--surface': '#1a2436',
  '--surface-raised': '#222c3c',

  '--ring': '#3b82f6',
}
