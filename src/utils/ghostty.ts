import fs from "fs/promises"
import path from "path"
import os from "os"
import { GhosttyOptions, Readyable } from "../types.js"

export class GhosttyBase implements GhosttyOptions, Readyable<GhosttyBase> {
	ghosttyDir: string
	themesDir: string
	ready: Promise<typeof this>

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

		result.themesDir = base?.themesDir as string
		if (!result.themesDir) {
			result.themesDir = path.join(result.ghosttyDir, "themes")
		}

		return result as O
	}

	static async mkdirs<O extends GhosttyOptions>(dirs: Partial<O> = {}) {
		const mkdirs = []

		const { ghosttyDir, themesDir } = dirs
		if (ghosttyDir) {
			mkdirs.push(ghosttyDir)
		}
		if (themesDir) {
			mkdirs.push(themesDir)
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
		this.themesDir = null as unknown as string
		GhosttyBase.default(base, this)
		this.ready = GhosttyBase.ready(this)
	}
}
