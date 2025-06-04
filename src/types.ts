import type { Neovim } from "neovim"

export type Zalgo<T> = T | Promise<T>

export interface HighlightAttrs<T = number> {
	fg?: T
	bg?: T
	sp?: T
	bold?: boolean
	italic?: boolean
	underline?: boolean
	undercurl?: boolean
	reverse?: boolean
}

export type RGB = [number, number, number]
export type Hex = string
export type ColorFormat = "num" | "hex" | "rgb" | undefined

export type HlGroups<T = number> = Record<string, HighlightAttrs<T>>
export type HlGroupsNum = HlGroups<number>
export type HlGroupsRGB = HlGroups<RGB>
export type HlGroupsHex = HlGroups<Hex>

export interface NvimOptions {
	nvim: Neovim
}

export interface ZNvimOptions {
	nvim: Zalgo<Neovim>
}

export interface GhosttyOptions {
	ghosttyDir: string
}

export type NvimGhosttyOptions = NvimOptions & GhosttyOptions

export interface Readyable<T> {
	ready: Promise<T>
}
