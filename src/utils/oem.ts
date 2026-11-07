import { isWeb } from '#/config'

const oem = isWeb ? window.brekekeOem : undefined

export const oemColor = (
  key: 'primary' | 'warning' | 'danger' | 'info',
  brekeke: string,
) => {
  const value = oem?.colors?.[key]
  if (typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)) {
    return value
  }
  if (value !== undefined) {
    console.error(
      `oem.js: colors.${key} ${JSON.stringify(value)} is not #RRGGBB, keeping ${brekeke}`,
    )
  }
  return brekeke
}

export const oemProductName = (brekeke: string) => {
  const value = oem?.productName
  if (typeof value === 'string' && value.trim() !== '') {
    return value.trim()
  }
  if (value !== undefined) {
    console.error(
      `oem.js: productName ${JSON.stringify(value)} is empty or not a string, keeping ${brekeke}`,
    )
  }
  return brekeke
}
