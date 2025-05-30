import { type Neovim } from "neovim"
import { extractColors } from "../commands/extract-colors"
import { defineLuaFunction } from "./nvim"
import { HlGroupsNum } from "../types"

function jsToLua(obj: any): string {
  if (obj === null || obj === undefined) {
    return "nil"
  }
  if (typeof obj === "boolean") {
    return obj ? "true" : "false"
  }
  if (typeof obj === "number") {
    return obj.toString()
  }
  if (typeof obj === "string") {
    return `'${obj.replace(/'/g, "\\'")}'`
  }
  if (Array.isArray(obj)) {
    return `{${obj.map(jsToLua).join(", ")}}`
  }
  if (typeof obj === "object") {
    const entries = []
    for (const [key, value] of Object.entries(obj)) {
      entries.push(`${key} = ${jsToLua(value)}`)
    }
    return `{${entries.join(", ")}}`
  }
  return "nil"
}

export async function buildRestoreColors(nvim: Neovim): Promise<void> {
  nvim.command("highlight clear")

  // there doesn't seem to be a way to actually remove a highlight group once named
  // we can empty them out but not remove them.
  // leaving this function in place for now as a reminder of this situation, rather than calling highlight clear directly
  const luaLines = [
    "  -- First clear all highlight groups",
    "  vim.cmd('highlight clear')",
  ]

  const body = luaLines.join("\n")
  await defineLuaFunction(nvim, "restore_colors", body)
}

export async function restoreColors(nvim: Neovim): Promise<void> {
  await nvim.lua("restore_colors()", [])
}
