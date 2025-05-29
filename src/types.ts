export type Zalgo<T> = T | Promise<T>

export interface HighlightAttrs {
  foreground?: number
  background?: number
  special?: number
  bold?: boolean
  italic?: boolean
  underline?: boolean
  undercurl?: boolean
  reverse?: boolean
}

export type HlGroups = Record<string, HighlightAttrs>
