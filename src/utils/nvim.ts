import * as child_process from "node:child_process"
import { attach, findNvim, type Neovim } from "neovim"

import { getLogger } from "neovim/lib/utils/logger"

export async function createNvim(): Promise<Neovim> {
  loggerHack()

  const found = findNvim({ orderBy: "desc", minVersion: "0.9.0" })
  const proc = child_process.spawn(
    found.matches[0].path,
    ["--embed", "--headless"],
    {},
  )
  return attach({ proc })
}

/**
 * Undo how `neovim` wraps console in winston
 * https://github.com/neovim/node-client/blob/master/packages/neovim/src/utils/logger.ts
 */
export function loggerHack() {
  //process.env.ALLOW_CONSOLE = "1"

  const replica = Object.entries(console)
  const logger = getLogger()
  replica.forEach(([k, v]) => ((console as any)[k] = v))
}

/**
 * Defines a Lua function in the Neovim global scope
 * @param nvim - Neovim instance
 * @param name - Function name to define
 * @param body - Lua function body
 */
export async function defineLuaFunction(nvim: Neovim, name: string, body: string): Promise<void> {
  await nvim.execLua(`
    _G.${name} = function(...)
      ${body}
    end
  `, []);
}
