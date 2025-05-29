import * as child_process from "node:child_process"
import { attach, findNvim, type Neovim } from "neovim"

export async function createNvim(): Promise<Neovim> {
  const found = findNvim({ orderBy: "desc", minVersion: "0.9.0" })
  const proc = child_process.spawn(found.matches[0].path, ["--embed"], {})
  return attach({ proc })
}
