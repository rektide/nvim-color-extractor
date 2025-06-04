import fs from "fs/promises"
import path from "path"
import os from "os"
import type { GhosttyOptions, Readyable } from "../types.ts"

export class GhosttyBase implements GhosttyOptions, Readyable<GhosttyBase> {
	ghosttyDir: string
	ready: Promise<GhosttyBase>

	static default<O extends GhosttyOptions>(
		base?: Partial<GhosttyOptions>,
		onto?: Partial<O>,
	): O {
		const result = (onto || {}) as GhosttyOptions

		result.ghosttyDir = base?.ghosttyDir as string
		if (!result.ghosttyDir) {
			const xdgConfigDir =
				process.env.XDG_CONFIG_DIR || path.join(os.homedir(), ".config")
			result.ghosttyDir = path.join(xdgConfigDir, "ghostty")
		}

		return result as O
	}

	static async mkdirs<O extends GhosttyOptions>(dirs: Partial<O> = {}) {
		const mkdirs = []

		const { ghosttyDir } = dirs
		if (ghosttyDir) {
			mkdirs.push(ghosttyDir)
		}

		const mkAll = mkdirs.map((dir) => fs.mkdir(dir, { recursive: true }))
		await Promise.all(mkAll)

		return dirs
	}

	static async ready<G extends GhosttyBase>(self: G) {
		await GhosttyBase.mkdirs(self)
		return self
	}

	constructor(base?: Partial<GhosttyOptions>) {
		this.ghosttyDir = null as unknown as string
		GhosttyBase.default(base, this)
		this.ready = GhosttyBase.ready(this)
	}

	getThemesPath(colorscheme?: string) {
		return colorscheme
			? path.join(this.ghosttyDir, "themes", colorscheme)
			: path.join(this.ghosttyDir, "themes")
	}
}
