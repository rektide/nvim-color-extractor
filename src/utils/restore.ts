import { type Neovim } from "neovim"
import { extractColors } from "../commands/extract-colors"
import { defineLuaFunction } from "./nvim"
import { HlGroupsNum } from "../types"

function jsToLua(obj: any): string {
  if (obj === null || obj === undefined) {
    return 'nil'
  }
  if (typeof obj === 'boolean') {
    return obj ? 'true' : 'false'
  }
  if (typeof obj === 'number') {
    return obj.toString()
  }
  if (typeof obj === 'string') {
    return `'${obj.replace(/'/g, "\\'")}'`
  }
  if (Array.isArray(obj)) {
    return `{${obj.map(jsToLua).join(', ')}}`
  }
  if (typeof obj === 'object') {
    const entries = []
    for (const [key, value] of Object.entries(obj)) {
      entries.push(`${key} = ${jsToLua(value)}`)
    }
    return `{${entries.join(', ')}}`
  }
  return 'nil'
}

export async function buildRestoreColors(nvim: Neovim): Promise<void> {
  // Get current colors in numeric format
  const colors = await extractColors(false, { nvim, format: 'num' })

  // Build lua function that:
  // 1. First clears all highlight groups
  // 2. Then restores the saved colors
  const luaLines = [
    '-- First clear all highlight groups',
    'local highlights = vim.api.nvim_get_hl(0, {})',
    'for name,_ in pairs(highlights) do',
    '  vim.api.nvim_set_hl(0, name, nil)',
    'end',
    '',
    '-- Then restore saved colors'
  ]

  for (const [group, attrs] of Object.entries(colors)) {
    const luaAttrs = jsToLua(attrs)
    luaLines.push(`vim.api.nvim_set_hl(0, '${group}', ${luaAttrs})`)
  }

  const body = luaLines.join('\n')
  await defineLuaFunction(nvim, "restore_colors", body)
}

export async function restoreColors(nvim: Neovim): Promise<void> {
  await nvim.lua("restore_colors()", [])
}
