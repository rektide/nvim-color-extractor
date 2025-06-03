import fs from "fs/promises"
import path from "path"
import os from "os"
import { GhosttyOptions, Readyable } from "../types.js"
import { NvimGhosttyBase } from "./nvim-ghostty.ts"

export class GhosttyRandomer extends NvimGhosttyBase {
	schemes: string[] = []

	constructor(base?: Partial<GhosttyOptions & { schemes?: string[] }>) {
		super(base)
		this.schemes = base?.schemes ?? []
	}

	async random(): Promise<string> {
		if (this.schemes.length === 0) {
			throw new Error("No colorschemes found")
		}

		// Pick random scheme
		const randomScheme = this.schemes[Math.floor(Math.random() * this.schemes.length)]
		console.log(`Selected random colorscheme: ${randomScheme}`)

		// Check if theme already exists in Ghostty's directory
		let stat
		try {
			stat = await fs.stat(this.themesDir)
			if (!stat.isDirectory()) {
				throw new Error(
					`Ghostty themes directory isn't a directory: ${this.themesDir}`,
				)
			}
			console.log(`Theme ${randomScheme} already exists at ${this.themesDir}`)
		} catch (err) {
			if (stat) {
				throw err
			}
		}

		// Convert using GhosttyConvert's convert method
		const convert = new GhosttyConvert([])
		await convert.convert({
			ghosttyDir: this.ghosttyDir,
			themesDir: this.themesDir,
			colorscheme: randomScheme,
		})

		// Update Ghostty config to use this theme
		await this.updateGhosttyConfig(randomScheme)
		return randomScheme
	}

	async updateGhosttyConfig(colorscheme: string): Promise<void> {
		const configPath = path.join(path.dirname(this.ghosttyDir), "config")

		try {
			let configContent = ""
			try {
				configContent = await fs.readFile(configPath, "utf-8")
				// Comment out any existing theme lines
				configContent = configContent.replace(/^theme\s*=/gm, "# theme =")
			} catch (error) {
				if ((error as any)?.code !== "ENOENT") {
					throw error
				}
				// File doesn't exist yet, we'll create it
			}

			// Append new theme setting
			const sep = configContent.length ? "\n" : ""
			configContent += `${sep}theme = ${colorscheme}\n`

			await fs.writeFile(configPath, configContent)
			console.log(
				`Updated Ghostty config at ${configPath} to use colorscheme: ${colorscheme}`,
			)
		} catch (error) {
			console.error(`Failed to update Ghostty config: ${error}`)
		}
	}
}

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
