import { type Neovim } from "neovim"
import { extractColors } from "../commands/extract-colors"
import { defineLuaFunction } from "./nvim"

export async function buildRestoreColors(nvim: Neovim): Promise<void> {
  // Get current colors
  const colors = await extractColors(false, { nvim, rgb: false })

  // Build individual nvim_set_hl calls for each highlight group
  const luaLines: string[] = []

  for (const [group, attrs] of Object.entries(colors)) {
    luaLines.push(
      `  vim.api.nvim_set_hl(0, '${group}', ${JSON.stringify(attrs)})`,
    )
  }

  await defineLuaFunction(nvim, "restore_colors", luaLines.join("\n"))
}

export async function restoreColors(nvim: Neovim): Promise<void> {
  await nvim.lua("restore_colors", [])
}
