import * as child_process from "node:child_process"
import { attach, findNvim, type Neovim } from "neovim"

import { getLogger } from "neovim/lib/utils/logger.js"
import type { NvimOptions, Readyable, Zalgo, ZNvimOptions } from "../types.ts"

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

export class NvimBase implements ZNvimOptions, Readyable<NvimBase> {
	public nvim: Zalgo<Neovim>
	public ready: Promise<typeof this>

	static default(
		base?: Partial<ZNvimOptions>,
		onto?: Partial<ZNvimOptions>,
	): ZNvimOptions {
		const result = (onto ?? {}) as ZNvimOptions
		result.nvim = base?.nvim ?? createNvim()
		return result
	}

	static async ready<N extends NvimBase>(self: N) {
		const nvim = self.nvim
		self.nvim = nvim
		return self
	}

	constructor(base?: Partial<ZNvimOptions>) {
		this.nvim = null as unknown as Promise<Neovim>
		NvimBase.default(base, this)
		this.ready = NvimBase.ready(this)
	}

	async cleanup() {
		;(await this.nvim)?.quit()
	}
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
 * @param args - Named arguments to the Lua function (... will be automatically added)
 */
export async function defineLuaFunction(
	nvim: Neovim,
	name: string,
	body: string,
	args: string[] = [],
): Promise<void> {
	args = args.concat("...")

	const text = `
    _G.${name} = function(${args.join(",")})
      ${body}
    end`

	await nvim.lua(text, [])
}
