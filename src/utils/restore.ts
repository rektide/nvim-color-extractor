import { type Neovim } from 'neovim'
import { extractColors } from '../commands/extract-colors'
import { defineLuaFunction } from './nvim'

export async function buildRestoreColors(nvim: Neovim): Promise<string> {
  // Get current colors
  const colors = await extractColors(false, { nvim, rgb: false })
  
  // Build individual nvim_set_hl calls for each highlight group
  const luaLines: string[] = []
  
  for (const [group, attrs] of Object.entries(colors)) {
    const args: Record<string, any> = {}
    
    if (attrs.foreground) args.fg = attrs.foreground
    if (attrs.background) args.bg = attrs.background
    if (attrs.special) args.sp = attrs.special
    if (attrs.bold) args.bold = attrs.bold
    if (attrs.italic) args.italic = attrs.italic
    if (attrs.underline) args.underline = attrs.underline
    if (attrs.undercurl) args.undercurl = attrs.undercurl
    if (attrs.reverse) args.reverse = attrs.reverse

    luaLines.push(`vim.api.nvim_set_hl(0, '${group}', ${JSON.stringify(args)})`)
  }

  // Combine into one big function
  return luaLines.join('\n')
}

export async function restoreColors(nvim: Neovim): Promise<void> {
  const restoreFn = await buildRestoreColors(nvim)
  await defineLuaFunction(nvim, 'restore_colors', restoreFn)
  await nvim.execLua('restore_colors()', [])
}
