import type { Config } from 'stylelint'

export const config: Config = {
  customSyntax: 'postcss-scss',
  extends: ['stylelint-config-hudochenkov/order'],
}
