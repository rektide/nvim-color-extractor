import { Neovim } from "neovim"
import util from "node:util"
import type {
	GhosttyOptions,
	Readyable,
	Zalgo,
	ZNvimOptions,
} from "../types.ts"
import { GhosttyBase } from "./ghostty.ts"
import { NvimBase } from "./nvim.ts"

export type NvimGhosttyOptions = GhosttyOptions & ZNvimOptions
export type NvimGhosttyComposite = NvimGhosttyBase & GhosttyBase & NvimBase

export class NvimGhosttyBase
	implements ZNvimOptions, GhosttyOptions, Readyable<NvimGhosttyComposite>
{
	public nvim: Zalgo<Neovim>
	public ghosttyDir: string
	public themesDir: string
	public ready: Promise<NvimGhosttyComposite>

	static async ready(base: NvimGhosttyBase): Promise<NvimGhosttyComposite> {
		const nvimReady = NvimBase.ready(base as unknown as NvimBase)
		const ghosttyReady = GhosttyBase.ready(base as unknown as GhosttyBase)
		await nvimReady
		await ghosttyReady
		return base as unknown as NvimGhosttyComposite
	}

	constructor(base?: Partial<NvimGhosttyOptions>) {
		this.nvim = null as unknown as Neovim
		NvimBase.default(base, this)

		this.ghosttyDir = null as unknown as string
		this.themesDir = null as unknown as string
		GhosttyBase.default(base, this)

		this.ready = NvimGhosttyBase.ready(this)
	}

	cleanup = NvimBase.prototype.cleanup
	getThemesPath = GhosttyBase.prototype.getThemesPath
}

util.inherits(NvimGhosttyBase, NvimBase)
util.inherits(NvimGhosttyBase, GhosttyBase)
