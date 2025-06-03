import { Neovim } from "neovim"
import { GhosttyOptions, Readyable, ZNvimOptions } from "../types.ts"
import { NvimBase } from "./nvim.js"
import { GhosttyBase } from "./ghostty.js"

class NvimGhosttyBase
	extends NvimBase
	implements GhosttyOptions, Readyable<GhosttyOptions & NvimBase>
{
	ghosttyDir: string
	themesDir: string

	constructor(base?: Partial<ZNvimOptions | GhosttyOptions>) {
		super(base as Partial<ZNvimOptions> | undefined)

		this.ghosttyDir = null as unknown as string
		this.themesDir = null as unknown as string
		GhosttyBase.default(base as Partial<GhosttyOptions> | undefined, this)
		const nvimReady = this.ready
		const ghosttyReady = GhosttyBase.ready(this)
		this.ready = (async () => {
			await nvimReady
			await ghosttyReady
			return this
		})()
	}
}
