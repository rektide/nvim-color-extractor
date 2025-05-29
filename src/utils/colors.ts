import {
  ColorFormat,
  HlGroupsNum,
  HlGroupsRGB,
  HlGroupsHex,
  RGB,
} from "../types"

export function colorIntToRGB(color?: number): RGB | undefined {
  return color
    ? [
      (color >> 16) & 0xff, // red
      (color >> 8) & 0xff, // green
      color & 0xff, // blue
    ]
    : undefined
}

export function colorIntToHex(color?: number): string | undefined {
  if (!color) return undefined
  const r = (color >> 16) & 0xff
  const g = (color >> 8) & 0xff
  const b = color & 0xff
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

export function toColorFormat(
  hlGroups: HlGroupsNum,
  format: ColorFormat = "num",
) {
  switch (format) {
    case "hex":
      return hlgToHex(hlGroups)
    case "rgb":
      return hlgToRGB(hlGroups)
    case "num":
    default:
      return hlGroups
  }
}

export function hlgToRGB(hlGroups: HlGroupsNum): HlGroupsRGB {
  const processed: HlGroupsRGB = hlGroups as unknown as HlGroupsRGB
  for (const [key, attrs] of Object.entries(hlGroups)) {
    processed[key] = {
      ...attrs,
      fg: colorIntToRGB(attrs.fg),
      bg: colorIntToRGB(attrs.bg),
      sp: colorIntToRGB(attrs.sp),
    }
  }
  return processed
}

export function hlgToHex(hlGroups: HlGroupsNum): HlGroupsHex {
  const processed: HlGroupsHex = hlGroups as unknown as HlGroupsHex
  for (const [key, attrs] of Object.entries(hlGroups)) {
    processed[key] = {
      ...attrs,
      fg: colorIntToHex(attrs.fg),
      bg: colorIntToHex(attrs.bg),
      sp: colorIntToHex(attrs.sp),
    }
  }
  return processed
}
