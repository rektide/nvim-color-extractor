export type Zalgo<T> = T | Promise<T>

export interface HighlightAttrs<T = number> {
  foreground?: T
  background?: T
  special?: T
  bold?: boolean
  italic?: boolean
  underline?: boolean
  undercurl?: boolean
  reverse?: boolean
}

export type HlGroups<T = number> = Record<string, HighlightAttrs<T>>
export type HlGroupsNum = HlGroups<number>
