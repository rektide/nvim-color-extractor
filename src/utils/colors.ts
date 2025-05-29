import { HlGroups, HlGroupsNum } from '../types'

export function colorIntToRGB(color?: number): [number, number, number] | undefined {
  return color
    ? [
        (color >> 16) & 0xff, // red
        (color >> 8) & 0xff,  // green
        color & 0xff          // blue
      ]
    : undefined
}

export function processHighlightGroups(hlGroups: HlGroupsNum): HlGroupsNum {
  const processed: HlGroupsNum = {}
  for (const [key, attrs] of Object.entries(hlGroups)) {
    processed[key] = {
      ...attrs,
      fg: colorIntToRGB(attrs.foreground),
      bg: colorIntToRGB(attrs.background),
      sp: colorIntToRGB(attrs.special)
    }
  }
  return processed
}
