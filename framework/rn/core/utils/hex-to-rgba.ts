import parseColor from 'color-rgba'

export const hexToRgba = (hex: string, alpha: number) => {
  const [r, g, b] = parseColor(hex)
  return `rgba(${r},${g},${b},${alpha})`
}
