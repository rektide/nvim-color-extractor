import { HlGroups, HlGroupsNum, HlGroupsRGB, RGB } from "../types"

export function colorIntToRGB(color?: number): RGB | undefined {
  return color
    ? [
      (color >> 16) & 0xff, // red
      (color >> 8) & 0xff, // green
      color & 0xff, // blue
    ]
    : undefined
}

export function processHighlightGroups(hlGroups: HlGroupsNum): HlGroupsRGB {
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
